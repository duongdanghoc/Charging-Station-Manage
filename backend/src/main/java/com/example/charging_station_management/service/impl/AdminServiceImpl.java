package com.example.charging_station_management.service.impl;

import com.example.charging_station_management.dto.UserDto;
import com.example.charging_station_management.dto.request.ChartData;
import com.example.charging_station_management.dto.request.DashboardResponse;
import com.example.charging_station_management.dto.request.RegisterRequest;
import com.example.charging_station_management.dto.request.RescueStationRequest;
import com.example.charging_station_management.dto.request.UserFilterRequest;
import com.example.charging_station_management.dto.response.ElectricVehicleResponse;
import com.example.charging_station_management.dto.response.RegisterResponse;
import com.example.charging_station_management.dto.response.StationResponse;
// Import đầy đủ các Entity
import com.example.charging_station_management.entity.converters.*;
import com.example.charging_station_management.entity.enums.Role;
import com.example.charging_station_management.entity.enums.StationStatus;
import com.example.charging_station_management.exception.ResourceNotFoundException;
// Import đầy đủ các Repository
import com.example.charging_station_management.repository.*;
import com.example.charging_station_management.service.AdminService;
import com.example.charging_station_management.service.AuthService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

  // Các Repository cũ
  private final StationRepository stationRepository;
  private final UserRepository userRepository;
  private final AuthService authService;
  private final ElectricVehicleRepository electricVehicleRepository;
  private final CustomerRepository customerRepository;
  private final VendorRepository vendorRepository;
  private final ChargingSessionRepository chargingSessionRepository;

  // 👇 QUAN TRỌNG: Phải có 'final' để @RequiredArgsConstructor tự động inject
  private final RescueStationRepository rescueStationRepository;
  private final LocationRepository locationRepository;

  @Override
  public RegisterResponse createUser(RegisterRequest request) {
    return authService.register(request);
  }

  @Override
  public Page<UserDto> getUsers(UserFilterRequest request) {
    Specification<User> spec = (root, query, cb) -> {
      Predicate finalPredicate = cb.conjunction();
      final char escapeChar = '\\';
      final String roleColumnName = "user_type";

      if (request.getRole() != null) {
        finalPredicate = cb.and(finalPredicate,
            cb.equal(root.get(roleColumnName), request.getRole().name()));
      }

      if (request.getStatus() != null) {
        finalPredicate = cb.and(finalPredicate,
            cb.equal(root.get("status"), request.getStatus()));
      }

      if (request.getKeyword() != null && !request.getKeyword().trim().isEmpty()) {
        String keyword = request.getKeyword().trim();
        String escapedKeyword = keyword.replace("%", "\\%").replace("_", "\\_");
        String searchPattern = "%" + escapedKeyword.toLowerCase() + "%";

        Predicate searchPredicate = cb.or(
            cb.like(cb.lower(root.get("name")), searchPattern, escapeChar),
            cb.like(cb.lower(root.get("email")), searchPattern, escapeChar));

        finalPredicate = cb.and(finalPredicate, searchPredicate);
      }
      return finalPredicate;
    };

    Page<User> userPage = userRepository.findAll(spec, request.getPageable());
    return userPage.map(this::mapUserToDto);
  }

  @Override
  public void deleteUser(int userId) {
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    user.setStatus(0);
    userRepository.save(user);
  }

  // --- CÁC HÀM MỚI CHO TRẠM CỨU HỘ ---

  @Override
  public Page<RescueStation> getRescueStations(String keyword, org.springframework.data.domain.Pageable pageable) {
    // Gọi hàm search mà bạn vừa viết trong Repository
    return rescueStationRepository.search(keyword, pageable);
  }

  @Override
  @Transactional
  public RescueStation createRescueStation(RescueStationRequest request) {
    // 1. Tạo và lưu Location trước (Class Location đã được import từ
    // entity.converters.*)
    Location location = new Location();
    location.setAddressDetail(request.getAddressDetail());
    location.setProvince(request.getProvince() != null ? request.getProvince() : "Chưa cập nhật");
    // Set mặc định nếu không có tọa độ
    location.setLatitude(request.getLatitude() != null ? request.getLatitude() : BigDecimal.ZERO);
    location.setLongitude(request.getLongitude() != null ? request.getLongitude() : BigDecimal.ZERO);

    location = locationRepository.save(location);

    // 2. Tạo RescueStation gắn với Location đó
    RescueStation station = new RescueStation();
    station.setName(request.getName());
    station.setPhone(request.getPhone());
    station.setEmail(request.getEmail());
    station.setOpenTime(request.getOpenTime());
    station.setCloseTime(request.getCloseTime());
    station.setLocation(location); // Link với location

    return rescueStationRepository.save(station);
  }

  // 2. THÊM MỚI: Hàm Update Trạm Cứu Hộ
  @Override
  @Transactional
  public RescueStation updateRescueStation(Integer id, RescueStationRequest request) {
    // 1. Tìm trạm
    RescueStation station = rescueStationRepository.findById(id)
        .orElseThrow(() -> new ResourceNotFoundException("Rescue Station not found with id: " + id));

    // 2. Cập nhật thông tin cơ bản
    station.setName(request.getName());
    station.setPhone(request.getPhone());
    station.setEmail(request.getEmail());
    station.setOpenTime(request.getOpenTime());
    station.setCloseTime(request.getCloseTime());

    // 3. Cập nhật Location (Xử lý an toàn)
    Location location = station.getLocation();
    if (location == null) {
      // Nếu chưa có location (dữ liệu cũ lỗi), tạo mới luôn
      location = new Location();
      station.setLocation(location);
    }

    // Gán dữ liệu mới vào Location
    location.setAddressDetail(request.getAddressDetail());
    location.setProvince(request.getProvince() != null ? request.getProvince() : location.getProvince());
    if (request.getLatitude() != null)
      location.setLatitude(request.getLatitude());
    if (request.getLongitude() != null)
      location.setLongitude(request.getLongitude());

    // Lưu Location trước
    locationRepository.save(location);

    // 4. Lưu Station
    return rescueStationRepository.save(station);
  }

  @Override
  public void deleteRescueStation(Integer id) {
    rescueStationRepository.deleteById(id);
  }

  // --- DASHBOARD ---
  @Override
  public DashboardResponse getDashboardStats() {
    long totalUsers = userRepository.count();
    long totalCustomers = customerRepository.count();
    long totalVendors = vendorRepository.count();
    long totalStations = stationRepository.count();
    long totalSessions = chargingSessionRepository.count();

    BigDecimal revenue = BigDecimal.ZERO;
    try {
      revenue = chargingSessionRepository.sumTotalRevenue();
      if (revenue == null)
        revenue = BigDecimal.ZERO;
    } catch (Exception e) {
      System.err.println("⚠️ Lỗi tính tổng doanh thu: " + e.getMessage());
    }

    List<ChartData> revenueChart = new ArrayList<>();
    List<ChartData> sessionChart = new ArrayList<>();

    try {
      List<Object[]> revenueRaw = chargingSessionRepository.getRevenueLast6Months();
      for (Object[] obj : revenueRaw) {
        String time = obj[0] != null ? obj[0].toString() : "N/A";
        BigDecimal val = obj[1] != null ? new BigDecimal(obj[1].toString()) : BigDecimal.ZERO;
        revenueChart.add(new ChartData(time, val));
      }
    } catch (Exception e) {
      System.err.println("⚠️ Lỗi query biểu đồ Doanh thu: " + e.getMessage());
    }

    try {
      List<Object[]> sessionRaw = chargingSessionRepository.getSessionsLast6Months();
      for (Object[] obj : sessionRaw) {
        String time = obj[0] != null ? obj[0].toString() : "N/A";
        Number val = obj[1] != null ? new BigDecimal(obj[1].toString()) : 0;
        sessionChart.add(new ChartData(time, val));
      }
    } catch (Exception e) {
      System.err.println("⚠️ Lỗi query biểu đồ Phiên sạc: " + e.getMessage());
    }

    return DashboardResponse.builder()
        .totalUsers(totalUsers)
        .totalCustomers(totalCustomers)
        .totalVendors(totalVendors)
        .totalStations(totalStations)
        .totalSessions(totalSessions)
        .totalRevenue(revenue)
        .revenueChartData(revenueChart)
        .sessionChartData(sessionChart)
        .build();
  }

  // --- CÁC HÀM KHÁC ---
  @Override
  @Transactional(readOnly = true)
  public Page<StationResponse> getStationsByVendor(Integer vendorId,
      org.springframework.data.domain.Pageable pageable) {
    if (!userRepository.existsById(vendorId)) {
      throw new ResourceNotFoundException("Vendor not found with id: " + vendorId);
    }
    Page<Station> stations = stationRepository.findByVendorId(vendorId, pageable);
    return stations.map(this::mapStationToAdminResponse);
  }

  @Override
  @Transactional(readOnly = true)
  public Page<ElectricVehicleResponse> getVehiclesByCustomer(Integer customerId,
      org.springframework.data.domain.Pageable pageable) {
    if (!userRepository.existsById(customerId)) {
      throw new ResourceNotFoundException("Customer not found with id: " + customerId);
    }
    User user = userRepository.findById(customerId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + customerId));

    // 2. Thay vì xóa, ta đổi trạng thái thành 0 (Inactive)
    user.setStatus(0);

    // 3. Lưu lại
    userRepository.save(user);

    Page<ElectricVehicle> vehicles = electricVehicleRepository.findByCustomerId(customerId, pageable);
    return vehicles.map(this::mapVehicleToDto);
  }

  // --- MAPPER HELPER ---
  private UserDto mapUserToDto(User user) {
    Role userRole = determineUserRole(user);
    return UserDto.builder()
        .id(user.getId())
        .name(user.getName())
        .email(user.getEmail())
        .phone(user.getPhone())
        .status(user.getStatus())
        .role(userRole)
        .build();
  }

  private StationResponse mapStationToAdminResponse(Station station) {
    try {
      String fullAddress = "Chưa cập nhật";
      if (station.getLocation() != null) {
        String detail = station.getLocation().getAddressDetail() != null ? station.getLocation().getAddressDetail()
            : "";
        String province = station.getLocation().getProvince() != null ? station.getLocation().getProvince() : "";
        fullAddress = (detail + ", " + province).trim();
        if (fullAddress.startsWith(","))
          fullAddress = fullAddress.substring(1).trim();
      }

      int totalPorts = 0;
      int totalPoles = 0;
      if (station.getChargingPoles() != null) {
        totalPoles = station.getChargingPoles().size();
        totalPorts = station.getChargingPoles().stream()
            .mapToInt(pole -> pole.getConnectorCount() != null ? pole.getConnectorCount() : 0)
            .sum();
      }

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
          .lastCheck("2024-06-01")
          .build();
    } catch (Exception e) {
      e.printStackTrace();
      return null;
    }
  }

  private ElectricVehicleResponse mapVehicleToDto(ElectricVehicle vehicle) {
    return ElectricVehicleResponse.builder()
        .id(vehicle.getId())
        .customerId(vehicle.getCustomer() != null ? vehicle.getCustomer().getId() : null)
        .customerName(vehicle.getCustomer() != null ? vehicle.getCustomer().getName() : "Unknown")
        .brand(vehicle.getBrand())
        .model(vehicle.getModel())
        .licensePlate(vehicle.getLicensePlate())
        .batteryCapacity(vehicle.getBatteryCapacity())
        .vehicleType(vehicle.getVehicleType() != null ? vehicle.getVehicleType().name() : "UNKNOWN")
        .connectorType(vehicle.getConnectorType() != null ? vehicle.getConnectorType().name() : "UNKNOWN")
        .build();
  }

  private Role determineUserRole(User user) {
    if (user instanceof Admin)
      return Role.ADMIN;
    else if (user instanceof Customer)
      return Role.CUSTOMER;
    else if (user instanceof Vendor)
      return Role.VENDOR;
    throw new RuntimeException("Unknown user type for user: " + user.getEmail());
  }
}
