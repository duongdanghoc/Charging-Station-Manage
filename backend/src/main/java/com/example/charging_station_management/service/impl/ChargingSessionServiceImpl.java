package com.example.charging_station_management.service.impl;

import com.example.charging_station_management.dto.mapper.ChargingSessionMapper;
import com.example.charging_station_management.dto.request.ChargingSessionFilterRequest;
import com.example.charging_station_management.dto.response.ChargingSessionDetailResponse;
import com.example.charging_station_management.entity.converters.ChargingSession;
import com.example.charging_station_management.repository.ChargingSessionRepository;
import com.example.charging_station_management.service.ChargingSessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChargingSessionServiceImpl implements ChargingSessionService {
    private final ChargingSessionRepository chargingSessionRepository;
    private final ChargingSessionMapper chargingSessionMapper;
    // Added dependencies
    private final com.example.charging_station_management.repository.ChargingConnectorRepository connectorRepository;
    private final com.example.charging_station_management.repository.ElectricVehicleRepository vehicleRepository;

    // Constants
    private static final java.math.BigDecimal PRICE_PER_KWH = new java.math.BigDecimal("3000");
    private static final double KWH_PER_MINUTE = 0.5;

    @Override
    public Page<ChargingSessionDetailResponse> getAllChargingSessions(
            ChargingSessionFilterRequest filterRequest,
            Pageable pageable) {

        log.info("Fetching charging sessions with filters: {}", filterRequest);

        Page<ChargingSession> sessions = chargingSessionRepository.searchChargingSessions(
                filterRequest.getCustomerId(),
                filterRequest.getStationId(),
                filterRequest.getStatus(),
                filterRequest.getStartTimeFrom(),
                filterRequest.getStartTimeTo(),
                filterRequest.getEndTimeFrom(),
                filterRequest.getEndTimeTo(),
                filterRequest.getCustomerName(),
                filterRequest.getStationName(),
                filterRequest.getLicensePlate(),
                pageable
        );

        log.info("Found {} charging sessions", sessions.getTotalElements());

        return sessions.map(chargingSessionMapper::toDetailResponse);
    }

    @Override
    public ChargingSessionDetailResponse getChargingSessionById(Integer sessionId) {
        log.info("Fetching charging session with id: {}", sessionId);

        ChargingSession session = chargingSessionRepository.findById(sessionId)
                .orElseThrow(() -> {
                    log.error("Charging session not found with id: {}", sessionId);
                    return new RuntimeException("Charging session not found: " + sessionId);
                });

        return chargingSessionMapper.toDetailResponse(session);
    }

    // --- Local Implementation ---

    @Override
    @Transactional
    public ChargingSession startSession(Integer userId, Integer connectorId, Integer vehicleId) {
        log.info("User {} requesting start session on connector {} with vehicle {}", userId, connectorId, vehicleId);

        // 1. Check User
        if (userId == null) throw new RuntimeException("User ID is required");
        java.util.List<ChargingSession> activeSessions = chargingSessionRepository.findByCustomerIdAndStatus(userId, com.example.charging_station_management.entity.enums.SessionStatus.CHARGING);
        if (!activeSessions.isEmpty()) {
            throw new RuntimeException("Bạn đang có một phiên sạc chưa kết thúc. Vui lòng hoàn tất trước khi bắt đầu phiên mới.");
        }

        // 2. Check Connector
        com.example.charging_station_management.entity.converters.ChargingConnector connector = connectorRepository.findById(connectorId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đầu sạc với ID: " + connectorId));

        if (connector.getStatus() != com.example.charging_station_management.entity.enums.ConnectorStatus.AVAILABLE) {
            throw new RuntimeException("Đầu sạc này đang bận hoặc bảo trì.");
        }

        // 3. Check Vehicle
        com.example.charging_station_management.entity.converters.ElectricVehicle vehicle = vehicleRepository.findByIdAndCustomerId(vehicleId, userId)
                .orElseThrow(() -> new RuntimeException("Xe không tồn tại hoặc không thuộc về bạn."));

        // 4. Create Session
        ChargingSession session = new ChargingSession();
        session.setChargingConnector(connector);
        session.setElectricVehicle(vehicle);
        session.setStartTime(java.time.LocalDateTime.now());
        session.setStatus(com.example.charging_station_management.entity.enums.SessionStatus.CHARGING);
        session.setEnergyKwh(java.math.BigDecimal.ZERO);
        session.setCost(java.math.BigDecimal.ZERO);

        // 5. Update Connector
        connector.setStatus(com.example.charging_station_management.entity.enums.ConnectorStatus.INUSE);
        connectorRepository.save(connector);
        return chargingSessionRepository.save(session);
    }

    @Override
    @Transactional
    public ChargingSession stopSession(Integer userId, Integer sessionId) {
        log.info("User {} requesting stop session {}", userId, sessionId);

        ChargingSession session = chargingSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Phiên sạc không tồn tại"));

        // 1. Validate Owner
        if (session.getElectricVehicle().getCustomer().getId() != userId) {
            throw new RuntimeException("Bạn không có quyền dừng phiên sạc này.");
        }

        if (session.getStatus() != com.example.charging_station_management.entity.enums.SessionStatus.CHARGING) {
            throw new RuntimeException("Phiên sạc này đã kết thúc hoặc chưa bắt đầu.");
        }

        // 2. Calculate
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        session.setEndTime(now);

        java.time.Duration duration = java.time.Duration.between(session.getStartTime(), now);
        long minutes = duration.toMinutes();
        if (minutes < 1) minutes = 1;

        java.math.BigDecimal energy = java.math.BigDecimal.valueOf(minutes * KWH_PER_MINUTE);
        java.math.BigDecimal cost = energy.multiply(PRICE_PER_KWH);

        session.setEnergyKwh(energy);
        session.setCost(cost);
        session.setStatus(com.example.charging_station_management.entity.enums.SessionStatus.COMPLETED);

        // 3. Free Connector
        com.example.charging_station_management.entity.converters.ChargingConnector connector = session.getChargingConnector();
        connector.setStatus(com.example.charging_station_management.entity.enums.ConnectorStatus.AVAILABLE);
        connectorRepository.save(connector);

        return chargingSessionRepository.save(session);
    }

    @Override
    public ChargingSession getCurrentSession(Integer userId) {
        java.util.List<ChargingSession> activeSessions = chargingSessionRepository.findByCustomerIdAndStatus(userId, com.example.charging_station_management.entity.enums.SessionStatus.CHARGING);
        if (activeSessions.isEmpty()) {
            return null;
        }
        return activeSessions.get(0);
    }

    @Override
    public Page<ChargingSession> getSessionHistory(Integer userId, Pageable pageable) {
        return chargingSessionRepository.findByElectricVehicle_Customer_IdOrderByStartTimeDesc(userId, pageable);
    }
}
