package com.example.charging_station_management.service.impl;

import com.example.charging_station_management.dto.request.CreateConnectorRequest;
import com.example.charging_station_management.dto.request.UpdateConnectorRequest;
import com.example.charging_station_management.dto.response.ConnectorDetailResponse;
import com.example.charging_station_management.dto.response.ConnectorResponse;
import com.example.charging_station_management.dto.response.SessionSummary;
import com.example.charging_station_management.entity.converters.ChargingConnector;
import com.example.charging_station_management.entity.converters.ChargingPole;
import com.example.charging_station_management.entity.converters.ChargingSession;
import com.example.charging_station_management.entity.enums.ConnectorStatus;
import com.example.charging_station_management.entity.enums.ConnectorType;
import com.example.charging_station_management.repository.ChargingConnectorRepository;
import com.example.charging_station_management.repository.ChargingPoleRepository;
import com.example.charging_station_management.service.ConnectorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ConnectorServiceImpl implements ConnectorService {

    private final ChargingConnectorRepository connectorRepository;
    private final ChargingPoleRepository poleRepository;
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    @Override
    @Transactional
    public ConnectorResponse createConnector(Integer vendorId, CreateConnectorRequest request) {
        log.info("Creating new connector for vendor: {}", vendorId);

        validateConnectorInfo(request);

        ChargingPole pole = poleRepository.findByIdAndVendorId(request.getPoleId(), vendorId)
                .orElseThrow(() -> {
                    log.error("Pole {} not found or not belong to vendor {}", request.getPoleId(), vendorId);
                    return new RuntimeException("Pole không tồn tại hoặc không thuộc quyền quản lý của bạn");
                });

        List<ChargingConnector> existingConnectors = connectorRepository.findByPoleId(pole.getId());
        if (existingConnectors.size() >= pole.getConnectorCount()) {
            log.error("Pole {} has reached maximum connector count", pole.getId());
            throw new RuntimeException("Pole đã đạt số lượng connector tối đa: " + pole.getConnectorCount());
        }

        if (request.getMaxPower().compareTo(pole.getMaxPower()) > 0) {
            log.error("Connector max power {} exceeds pole max power {}",
                    request.getMaxPower(), pole.getMaxPower());
            throw new RuntimeException("Công suất connector không được vượt quá công suất của pole: "
                    + pole.getMaxPower() + " kW");
        }

        ChargingConnector connector = new ChargingConnector();
        connector.setPole(pole);
        connector.setConnectorType(request.getConnectorType());
        connector.setMaxPower(request.getMaxPower());
        connector.setStatus(ConnectorStatus.AVAILABLE);

        ChargingConnector savedConnector = connectorRepository.save(connector);
        log.info("Connector created successfully with ID: {}", savedConnector.getId());

        return mapToConnectorResponse(savedConnector);
    }

    @Override
    @Transactional
    public ConnectorResponse updateConnector(Integer vendorId, Integer connectorId, UpdateConnectorRequest request) {
        log.info("Updating connector {} for vendor {}", connectorId, vendorId);

        ChargingConnector connector = connectorRepository.findByIdAndVendorId(connectorId, vendorId)
                .orElseThrow(() -> {
                    log.error("Connector {} not found or not belong to vendor {}", connectorId, vendorId);
                    return new RuntimeException("Connector không tồn tại hoặc bạn không có quyền truy cập");
                });

        if (request.getConnectorType() != null) {
            connector.setConnectorType(request.getConnectorType());
        }

        if (request.getMaxPower() != null) {
            if (request.getMaxPower().compareTo(connector.getPole().getMaxPower()) > 0) {
                throw new RuntimeException("Công suất connector không được vượt quá công suất của pole: "
                        + connector.getPole().getMaxPower() + " kW");
            }
            connector.setMaxPower(request.getMaxPower());
        }

        if (request.getStatus() != null) {
            if (connectorRepository.isConnectorInUse(connectorId)) {
                throw new RuntimeException("Không thể thay đổi trạng thái khi connector đang được sử dụng");
            }
            connector.setStatus(request.getStatus());
        }

        ChargingConnector updatedConnector = connectorRepository.save(connector);
        log.info("Connector {} updated successfully", connectorId);

        return mapToConnectorResponse(updatedConnector);
    }

    @Override
    @Transactional
    public ConnectorResponse updateConnectorStatus(Integer vendorId, Integer connectorId, ConnectorStatus status) {
        log.info("Updating connector {} status to {} for vendor {}", connectorId, status, vendorId);

        ChargingConnector connector = connectorRepository.findByIdAndVendorId(connectorId, vendorId)
                .orElseThrow(() -> new RuntimeException("Connector không tồn tại hoặc bạn không có quyền truy cập"));

        if (connectorRepository.isConnectorInUse(connectorId) && status != ConnectorStatus.INUSE) {
            throw new RuntimeException("Không thể thay đổi trạng thái khi connector đang được sử dụng");
        }

        connector.setStatus(status);
        ChargingConnector updatedConnector = connectorRepository.save(connector);

        log.info("Connector {} status updated to {}", connectorId, status);
        return mapToConnectorResponse(updatedConnector);
    }

    @Override
    @Transactional
    public void deleteConnector(Integer vendorId, Integer connectorId) {
        log.info("Deleting connector {} for vendor {}", connectorId, vendorId);

        ChargingConnector connector = connectorRepository.findByIdAndVendorId(connectorId, vendorId)
                .orElseThrow(() -> new RuntimeException("Connector không tồn tại hoặc bạn không có quyền truy cập"));

        if (connectorRepository.isConnectorInUse(connectorId)) {
            throw new RuntimeException("Không thể xóa connector đang được sử dụng");
        }

        if (connector.getChargingSessions() != null && !connector.getChargingSessions().isEmpty()) {
            log.warn("Connector {} has charging sessions history", connectorId);
            throw new RuntimeException("Không thể xóa connector đã có lịch sử sử dụng");
        }

        connectorRepository.delete(connector);
        log.info("Connector {} deleted successfully", connectorId);
    }

    @Override
    public ConnectorDetailResponse getConnectorDetail(Integer vendorId, Integer connectorId) {
        log.info("Getting connector {} detail for vendor {}", connectorId, vendorId);

        ChargingConnector connector = connectorRepository.findByIdAndVendorId(connectorId, vendorId)
                .orElseThrow(() -> new RuntimeException("Connector không tồn tại hoặc bạn không có quyền truy cập"));

        List<SessionSummary> recentSessions = connector.getChargingSessions() != null
                ? connector.getChargingSessions().stream()
                .sorted((s1, s2) -> s2.getStartTime().compareTo(s1.getStartTime()))
                .limit(5)
                .map(this::mapToSessionSummary)
                .collect(Collectors.toList())
                : List.of();

        return new ConnectorDetailResponse(
                connector.getId(),
                connector.getPole().getId(),
                connector.getPole().getManufacturer(),
                connector.getPole().getMaxPower(),
                connector.getPole().getStation().getId(),
                connector.getPole().getStation().getName(),
                connector.getPole().getStation().getLocation().getAddressDetail(),
                connector.getConnectorType(),
                connector.getMaxPower(),
                connector.getStatus(),
                connector.getChargingSessions() != null ? connector.getChargingSessions().size() : 0,
                recentSessions);
    }

    @Override
    public List<ConnectorResponse> getAllConnectorsByVendor(Integer vendorId) {
        log.info("Getting all connectors for vendor: {}", vendorId);

        List<ChargingConnector> connectors = connectorRepository.findByVendorId(vendorId);

        return connectors.stream()
                .map(this::mapToConnectorResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<ConnectorResponse> searchConnectors(
            Integer vendorId,
            ConnectorType connectorType,
            ConnectorStatus status,
            Integer poleId) {

        log.info("Searching connectors for vendor {} with filters - type: {}, status: {}, poleId: {}",
                vendorId, connectorType, status, poleId);

        List<ChargingConnector> connectors = connectorRepository.searchConnectors(
                vendorId, connectorType, status, poleId);

        return connectors.stream()
                .map(this::mapToConnectorResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void validateConnectorInfo(CreateConnectorRequest request) {
        if (request.getPoleId() == null) {
            throw new RuntimeException("Pole ID không được để trống");
        }

        if (request.getConnectorType() == null) {
            throw new RuntimeException("Loại đầu sạc không được để trống");
        }

        if (request.getMaxPower() == null || request.getMaxPower().doubleValue() <= 0) {
            throw new RuntimeException("Công suất tối đa phải lớn hơn 0");
        }
    }

    private ConnectorResponse mapToConnectorResponse(ChargingConnector connector) {
        boolean isInUse = connectorRepository.isConnectorInUse(connector.getId());

        return new ConnectorResponse(
                connector.getId(),
                connector.getPole().getId(),
                connector.getPole().getManufacturer() + " - " + connector.getPole().getMaxPower() + "kW",
                connector.getPole().getStation().getId(),
                connector.getPole().getStation().getName(),
                connector.getConnectorType(),
                connector.getMaxPower(),
                connector.getStatus(),
                isInUse);
    }

    private SessionSummary mapToSessionSummary(ChargingSession session) {
        return new SessionSummary(
                session.getId(),
                session.getElectricVehicle().getLicensePlate(),
                session.getStartTime() != null ? session.getStartTime().format(DATE_TIME_FORMATTER) : null,
                session.getEndTime() != null ? session.getEndTime().format(DATE_TIME_FORMATTER) : null,
                session.getEnergyKwh(),
                session.getCost(),
                session.getStatus().name());
    }
}