package com.example.charging_station_management.service.impl;

import com.example.charging_station_management.dto.UserDto;
import com.example.charging_station_management.dto.request.RegisterRequest;
import com.example.charging_station_management.dto.request.UserFilterRequest;
import com.example.charging_station_management.dto.response.RegisterResponse;
import com.example.charging_station_management.entity.converters.Admin;
import com.example.charging_station_management.entity.converters.Customer;
import com.example.charging_station_management.entity.converters.User;
import com.example.charging_station_management.entity.converters.Vendor;
import com.example.charging_station_management.entity.enums.Role;
import com.example.charging_station_management.exception.ResourceNotFoundException;
import com.example.charging_station_management.repository.UserRepository;
import com.example.charging_station_management.service.AdminService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import com.example.charging_station_management.service.AuthService;

@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

  private final UserRepository userRepository;
  private final AuthService authService;

  @Override
  public RegisterResponse createUser(RegisterRequest request) {
    // Tái sử dụng logic đăng ký cốt lõi từ AuthService
    // Logic này đã bao gồm mã hóa password và kiểm tra trùng email
    return authService.register(request);
  }

  @Override
  public Page<UserDto> getUsers(UserFilterRequest request) {

    // 1. Logic tìm kiếm (Specification)
    Specification<User> spec = (root, query, cb) -> {

      Predicate finalPredicate = cb.conjunction();
      final char escapeChar = '\\'; // Ký tự escape tiêu chuẩn

      // Tên cột phân biệt vai trò (Đã được xác nhận là 'user_type' từ Entity)
      final String roleColumnName = "user_type";

      // Lọc theo Role (sử dụng cột roleColumnName)
      if (request.getRole() != null) {
        // SỬA ĐỔI: Loại bỏ .as(String.class) để JPA tự động xử lý mapping Enum sang
        // chuỗi DB
        // và dùng .name() để đảm bảo lấy giá trị chuỗi của Enum.
        finalPredicate = cb.and(finalPredicate,
            cb.equal(root.get(roleColumnName), request.getRole().name()));
      }

      // Lọc theo Status
      if (request.getStatus() != null) {
        finalPredicate = cb.and(finalPredicate,
            cb.equal(root.get("status"), request.getStatus()));
      }

      // Tìm kiếm theo Keyword (Tên hoặc Email)
      if (request.getKeyword() != null && !request.getKeyword().trim().isEmpty()) { // Dùng trim().isEmpty() an toàn hơn
        String keyword = request.getKeyword().trim();

        // KHẮC PHỤC LỖI 500/SQL: Xử lý Escape ký tự đặc biệt
        String escapedKeyword = keyword.replace("%", "\\%").replace("_", "\\_");

        // Tạo mẫu tìm kiếm an toàn và không phân biệt chữ hoa/thường.
        String searchPattern = "%" + escapedKeyword.toLowerCase() + "%";

        Predicate searchPredicate = cb.or(
            // Thêm tham số thứ ba (escapeChar) để báo cho JPA biết ký tự thoát là '\'
            cb.like(cb.lower(root.get("name")), searchPattern, escapeChar),
            cb.like(cb.lower(root.get("email")), searchPattern, escapeChar));

        finalPredicate = cb.and(finalPredicate, searchPredicate);
      }

      return finalPredicate;
    };

    // 2. Thực hiện tìm kiếm và phân trang
    Page<User> userPage = userRepository.findAll(spec, request.getPageable());

    // 3. Ánh xạ sang DTO
    return userPage.map(this::mapUserToDto);
  }

  @Override
  public void deleteUser(int userId) {
    // 1. Tìm user trong DB
    User user = userRepository.findById(userId)
        .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

    // 2. Thay vì xóa, ta đổi trạng thái thành 0 (Inactive)
    user.setStatus(0);

    // 3. Lưu lại
    userRepository.save(user);
  }

  // --- Mapper Function (Hàm ánh xạ) ---
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

  // --- Helper Function (Hàm xác định Role) ---
  private Role determineUserRole(User user) {
    if (user instanceof Admin) {
      return Role.ADMIN;
    } else if (user instanceof Customer) {
      return Role.CUSTOMER;
    } else if (user instanceof Vendor) {
      return Role.VENDOR;
    }
    // Nên trả về một giá trị an toàn (như Role.CUSTOMER) hoặc ném ngoại lệ rõ ràng
    // hơn
    throw new RuntimeException("Unknown user type for user: " + user.getEmail());
  }
}
