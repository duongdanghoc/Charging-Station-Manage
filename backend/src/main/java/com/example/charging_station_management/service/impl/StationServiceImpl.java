package com.example.charging_station_management.service.impl;

import com.example.charging_station_management.dto.mapper.StationMapper;
import com.example.charging_station_management.dto.request.CreateStationRequest;
import com.example.charging_station_management.dto.request.UpdateStationRequest;
import com.example.charging_station_management.dto.response.StationResponse;
import com.example.charging_station_management.entity.converters.Location;
import com.example.charging_station_management.entity.converters.Station;
import com.example.charging_station_management.entity.converters.User;
import com.example.charging_station_management.entity.converters.Vendor;
import com.example.charging_station_management.entity.enums.SessionStatus;
import com.example.charging_station_management.entity.enums.StationStatus;
import com.example.charging_station_management.entity.enums.VehicleType;
import com.example.charging_station_management.exception.ResourceNotFoundException;
import com.example.charging_station_management.repository.ChargingSessionRepository;
import com.example.charging_station_management.repository.LocationRepository;
import com.example.charging_station_management.repository.StationRepository;
import com.example.charging_station_management.repository.specification.StationSpecification;
import com.example.charging_station_management.service.StationService;
import com.example.charging_station_management.utils.helper.UserHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class StationServiceImpl implements StationService {

    private final StationRepository stationRepository;
    private final LocationRepository locationRepository;
    private final UserHelper userHelper;
    private final ChargingSessionRepository chargingSessionRepository;
    private final StationMapper stationMapper;

    // =========================================================================
    // HELPER METHODS
    // =========================================================================

    private Vendor getCurrentVendor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userHelper.findUserByEmail(email);

        if (user instanceof Vendor vendor) {
            return vendor;
        }
        throw new IllegalArgumentException("Người dùng hiện tại không phải là Vendor");
    }

    // =========================================================================
    // VENDOR METHODS
    // =========================================================================

    @Override
    @Transactional
    public StationResponse createStation(CreateStationRequest request) {
        Vendor vendor = getCurrentVendor();

        // 1. Tạo và lưu Location trước
        Location location = new Location();
        location.setLatitude(request.getLatitude());
        location.setLongitude(request.getLongitude());
        location.setProvince(request.getProvince());
        location.setAddressDetail(request.getAddressDetail());

        Location savedLocation = locationRepository.save(location);

        // 2. Tạo Station và gán Location đã lưu
        Station station = new Station();
        station.setName(request.getName());
        station.setOpenTime(request.getOpenTime());
        station.setCloseTime(request.getCloseTime());
        station.setType(request.getType());
        station.setStatus(1); // Mặc định Active
        station.setVendor(vendor);
        station.setLocation(savedLocation);

        Station savedStation = stationRepository.save(station);
        return stationMapper.toResponse(savedStation);
    }

    @Override
    @Transactional
    public StationResponse updateStation(Integer stationId, UpdateStationRequest request) {
        Vendor vendor = getCurrentVendor();
        Station station = stationRepository.findByIdAndVendorId(stationId, vendor.getId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Không tìm thấy trạm hoặc bạn không có quyền chỉnh sửa"));

        // Update Station fields
        if (request.getName() != null)
            station.setName(request.getName());
        if (request.getOpenTime() != null)
            station.setOpenTime(request.getOpenTime());
        if (request.getCloseTime() != null)
            station.setCloseTime(request.getCloseTime());
        if (request.getType() != null)
            station.setType(request.getType());
        if (request.getStatus() != null)
            station.setStatus(request.getStatus());

        // Update Location
        Location location = station.getLocation();
        boolean locationChanged = false;

        if (request.getLatitude() != null) {
            location.setLatitude(request.getLatitude());
            locationChanged = true;
        }
        if (request.getLongitude() != null) {
            location.setLongitude(request.getLongitude());
            locationChanged = true;
        }
        if (request.getProvince() != null) {
            location.setProvince(request.getProvince());
            locationChanged = true;
        }
        if (request.getAddressDetail() != null) {
            location.setAddressDetail(request.getAddressDetail());
            locationChanged = true;
        }

        if (locationChanged) {
            locationRepository.save(location);
        }

        Station updatedStation = stationRepository.save(station);
        return stationMapper.toResponse(updatedStation);
    }

    @Override
    @Transactional
    public void deleteStation(Integer stationId) {
        Vendor vendor = getCurrentVendor();

        // 1. Tìm trạm và check quyền sở hữu
        Station station = stationRepository.findByIdAndVendorId(stationId, vendor.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trạm hoặc bạn không có quyền xóa"));

        // 2. CHECK RÀNG BUỘC: Có phiên sạc đang hoạt động không?
        List<SessionStatus> activeStatuses = List.of(SessionStatus.PENDING, SessionStatus.CHARGING);
        long activeSessions = chargingSessionRepository.countByStationIdAndStatusIn(stationId, activeStatuses);

        if (activeSessions > 0) {
            throw new IllegalStateException("Không thể xóa: Trạm đang có phiên sạc đang diễn ra.");
        }

        // 3. Kiểm tra lịch sử giao dịch
        List<SessionStatus> historyStatuses = List.of(
                SessionStatus.COMPLETED,
                SessionStatus.CANCELLED,
                SessionStatus.FAILED
        );
        long historySessions = chargingSessionRepository.countByStationIdAndStatusIn(stationId, historyStatuses);

        if (historySessions > 0) {
            // Có lịch sử -> Xóa mềm (chuyển status sang DELETED)
            station.setStatus(StationStatus.DELETED.getValue());
            stationRepository.save(station);
        } else {
            // Trạm mới, chưa có lịch sử -> Xóa cứng
            stationRepository.delete(station);
        }
    }

    @Override
    public Page<StationResponse> getMyStations(String search, Integer status, VehicleType type, Pageable pageable) {
        Vendor vendor = getCurrentVendor();

        Page<Station> stations = stationRepository.findAll(
                StationSpecification.filterStations(vendor.getId(), search, status, type),
                pageable);

        return stations.map(stationMapper::toResponse);
    }

    // =========================================================================
    // ADMIN METHODS
    // =========================================================================

    @Override
    @Transactional(readOnly = true)
    public Page<StationResponse> getAllStations(Pageable pageable) {
        Page<Station> stations = stationRepository.findAll(pageable);
        return stations.map(this::mapToAdminResponse);
    }

    @Override
    public StationResponse getStationById(Integer stationId) {
        Station station = stationRepository.findById(stationId)
                .orElseThrow(() -> new ResourceNotFoundException("Station not found with id: " + stationId));
        return mapToAdminResponse(station);
    }

    @Override
    @Transactional
    public void updateStationStatus(Integer stationId, Integer newStatus) {
        Station station = stationRepository.findById(stationId)
                .orElseThrow(() -> new ResourceNotFoundException("Station not found with id: " + stationId));
        station.setStatus(newStatus);
        stationRepository.save(station);
    }

    @Override
    @Transactional
    public void adminDeleteStation(Integer stationId) {
        Station station = stationRepository.findById(stationId)
                .orElseThrow(() -> new ResourceNotFoundException("Station not found with id: " + stationId));
        stationRepository.delete(station);
    }

    // =========================================================================
    // MAPPER HELPER
    // =========================================================================

    /**
     * Mapper cho Admin - đầy đủ thông tin (revenue, ports, poles, status...)
     */
    private StationResponse mapToAdminResponse(Station station) {
        try {
            // 1. Xử lý địa chỉ an toàn
            String fullAddress = "Chưa cập nhật";
            if (station.getLocation() != null) {
                String detail = station.getLocation().getAddressDetail() != null
                        ? station.getLocation().getAddressDetail()
                        : "";
                String province = station.getLocation().getProvince() != null
                        ? station.getLocation().getProvince()
                        : "";
                fullAddress = detail + ", " + province;
            }

            // 2. Tính tổng cổng sạc (Ports) và số trụ sạc (Poles)
            int totalPorts = 0;
            int totalPoles = 0;

            if (station.getChargingPoles() != null) {
                totalPoles = station.getChargingPoles().size();
                // 👇 ĐÃ SỬA: Đếm từ list connectors thay vì gọi getConnectorCount() (biến đã xóa)
                totalPorts = station.getChargingPoles().stream()
                        .mapToInt(pole -> pole.getChargingConnectors() != null ? pole.getChargingConnectors().size() : 0)
                        .sum();
            }

            // 3. Xử lý trạng thái an toàn
            String statusStr = "INACTIVE";
            if (station.getStatus() != null) {
                statusStr = StationStatus.fromInt(station.getStatus()).name();
            }

            return StationResponse.builder()
                    .id(station.getId())
                    .name(station.getName() != null ? station.getName() : "Trạm không tên")
                    .address(fullAddress)
                    .poles(totalPoles)
                    .ports(totalPorts)
                    .status2(statusStr)
                    .revenue(BigDecimal.ZERO)
                    .build();

        } catch (Exception e) {
            // Log lỗi để debug
            System.err.println("Lỗi khi map trạm ID: " + station.getId());
            e.printStackTrace();

            // Trả về object mặc định thay vì null để tránh crash
            return StationResponse.builder()
                    .id(station.getId())
                    .name("Lỗi dữ liệu")
                    .address("N/A")
                    .poles(0)
                    .ports(0)
                    .status2("UNKNOWN")
                    .revenue(BigDecimal.ZERO)
                    .build();
        }
    }
}