package com.example.charging_station_management.service.impl;

import com.example.charging_station_management.dto.request.CreateStationRequest;
import com.example.charging_station_management.dto.request.UpdateStationRequest;
import com.example.charging_station_management.dto.response.StationResponse;
import com.example.charging_station_management.entity.converters.Location;
import com.example.charging_station_management.entity.converters.Station;
import com.example.charging_station_management.entity.converters.User;
import com.example.charging_station_management.entity.converters.Vendor;
import com.example.charging_station_management.entity.enums.StationStatus;
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

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.charging_station_management.dto.mapper.StationMapper;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class StationServiceImpl implements StationService {

  private final StationRepository stationRepository;
  private final LocationRepository locationRepository;
  private final UserHelper userHelper;
    private final StationRepository stationRepository;
    private final LocationRepository locationRepository;
    private final ChargingSessionRepository chargingSessionRepository;
    private final UserHelper userHelper;
    private final StationMapper stationMapper;

  // Helper method để lấy Vendor hiện tại từ SecurityContext
  private Vendor getCurrentVendor() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    String email = authentication.getName();
    User user = userHelper.findUserByEmail(email);

    if (user instanceof Vendor vendor) {
      return vendor;
    }
    throw new IllegalArgumentException("Người dùng hiện tại không phải là Vendor");
  }

  @Override
  @Transactional
  public StationResponse createStation(CreateStationRequest request) {
    Vendor vendor = getCurrentVendor();

    // 1. Tạo và LƯU Location trước
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
    return mapToResponse(savedStation);
  }

  @Override
  @Transactional
  public StationResponse updateStation(Integer stationId, UpdateStationRequest request) {
    Vendor vendor = getCurrentVendor();
    Station station = stationRepository.findByIdAndVendorId(stationId, vendor.getId())
        .orElseThrow(
            () -> new ResourceNotFoundException("Không tìm thấy trạm hoặc bạn không có quyền chỉnh sửa"));

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
    return mapToResponse(updatedStation);
  }

  @Override
  @Transactional
  public void deleteStation(Integer stationId) {
    Vendor vendor = getCurrentVendor();
    Station station = stationRepository.findByIdAndVendorId(stationId, vendor.getId())
        .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trạm hoặc bạn không có quyền xóa"));

    // Thực hiện xóa mềm (chuyển status về INACTIVE = 0) hoặc xóa cứng tùy nghiệp vụ
    // Ở đây tạm thời dùng xóa cứng của JPA
    stationRepository.delete(station);
  }

  @Override
  public Page<StationResponse> getMyStations(Pageable pageable) {
    Vendor vendor = getCurrentVendor();
    Page<Station> stations = stationRepository.findByVendorId(vendor.getId(), pageable);
    return stations.map(this::mapToResponse);
  }

  // ADMIN METHODS (IMPLEMENTATION MỚI)
  // =========================================================================

  @Override
  @Transactional(readOnly = true)
  public Page<StationResponse> getAllStations(Pageable pageable) {
    Page<Station> stations = stationRepository.findAll(pageable);
    // Sử dụng mapToAdminResponse để lấy đầy đủ thông tin cho Admin
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

  // Mapper cho Vendor (Thông tin cơ bản)
  private StationResponse mapToResponse(Station station) {
    return StationResponse.builder()
        .id(station.getId())
        .name(station.getName())
        .address(station.getLocation().getAddressDetail())
        .city(station.getLocation().getProvince())
        .latitude(station.getLocation().getLatitude().doubleValue())
        .longitude(station.getLocation().getLongitude().doubleValue())
        .openTime(station.getOpenTime())
        .closeTime(station.getCloseTime())
        // Convert Int -> String ("ACTIVE") để FE dễ hiển thị

        .status(station.getStatus())
        .type(station.getType())
        .vendorName(station.getVendor().getName())
        .build();
  }

  // Mapper cho Admin (Đầy đủ thông tin: revenue, status text...)

  // Thay thế hàm mapToAdminResponse cũ bằng hàm này
  private StationResponse mapToAdminResponse(Station station) {
    try {
      // 1. Xử lý địa chỉ an toàn (Tránh null location)
      String fullAddress = "Chưa cập nhật";
      if (station.getLocation() != null) {
        // Kiểm tra từng trường con để tránh null
        String detail = station.getLocation().getAddressDetail() != null ? station.getLocation().getAddressDetail()
            : "";
        String province = station.getLocation().getProvince() != null ? station.getLocation().getProvince() : "";
        fullAddress = detail + ", " + province;
      }

      // 2. Tính tổng cổng sạc an toàn (Tránh null list)
      // 2. Tính tổng cổng sạc (Ports) và Số trụ sạc (Poles)
      int totalPorts = 0;
      int totalPoles = 0; // <--- Biến mới để đếm trụ

      if (station.getChargingPoles() != null) {
        // Đếm số trụ sạc (Dựa trên kích thước danh sách)
        totalPoles = station.getChargingPoles().size(); //

        // Đếm tổng số cổng sạc (Cộng dồn connectorCount của từng trụ)
        totalPorts = station.getChargingPoles().stream()
            .mapToInt(pole -> pole.getConnectorCount() != null ? pole.getConnectorCount() : 0)
            .sum();
      }

      // 3. Xử lý trạng thái an toàn (Tránh null status)
      String statusStr = "INACTIVE"; // Giá trị mặc định
      if (station.getStatus() != null) {
        // Đảm bảo bạn đã có Enum StationStatus và hàm fromInt
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
          .lastCheck("2024-06-01")
          .build();

    } catch (Exception e) {
      // Log lỗi ra console để bạn biết trạm nào bị lỗi (ID bao nhiêu)
      System.err.println("Lỗi khi map trạm ID: " + station.getId());
      e.printStackTrace();
      return null; // Trả về null để tránh crash cả danh sách
    @Override
    @Transactional
    public StationResponse createStation(CreateStationRequest request) {
        Vendor vendor = getCurrentVendor();

        // 1. Tạo và LƯU Location trước
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

        // 2. CHECK RÀNG BUỘC: Có đang hoạt động không?
        // Các trạng thái coi là "đang hoạt động"
        List<SessionStatus> activeStatuses = List.of(SessionStatus.PENDING, SessionStatus.CHARGING);
        long activeSessions = chargingSessionRepository.countByStationIdAndStatusIn(stationId, activeStatuses);

        if (activeSessions > 0) {
            throw new IllegalStateException("Không thể xóa: Trạm đang có phiên sạc đang diễn ra.");
        }

        // 3. XÓA MỀM hay XÓA CỨNG?
        // Kiểm tra xem trạm đã từng có giao dịch/lịch sử chưa (Completed, Cancelled, Failed)
        List<SessionStatus> historyStatuses = List.of(SessionStatus.COMPLETED, SessionStatus.CANCELLED, SessionStatus.FAILED);
        long historySessions = chargingSessionRepository.countByStationIdAndStatusIn(stationId, historyStatuses);

        if (historySessions > 0) {
            // A. Có lịch sử -> Xóa mềm (Chuyển status sang DELETED = -1)
            station.setStatus(StationStatus.DELETED.getValue());
            stationRepository.save(station);
        } else {
            // B. Trạm mới tinh, chưa dùng bao giờ -> Xóa cứng (Bay màu khỏi DB)
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
  }
}
