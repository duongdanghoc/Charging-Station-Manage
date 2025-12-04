package com.example.charging_station_management.controller.admin;

import com.example.charging_station_management.dto.BaseApiResponse;
import com.example.charging_station_management.dto.request.RegisterRequest;
import com.example.charging_station_management.dto.request.UserFilterRequest;
import com.example.charging_station_management.dto.response.RegisterResponse;
import com.example.charging_station_management.repository.CustomerRepository;
import com.example.charging_station_management.repository.UserRepository;
import com.example.charging_station_management.repository.VendorRepository;
import com.example.charging_station_management.service.AdminService; // <-- Đảm bảo đã import

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService; // Inject Service
    private final UserRepository userRepository; // Giữ lại để dùng cho API stats đơn giản
    private final CustomerRepository customerRepository;
    private final VendorRepository vendorRepository;

    // API 1: Lấy thống kê (giữ lại code đơn giản)
    @GetMapping("/stats")
    public ResponseEntity<?> getDashboardStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalCustomers", customerRepository.count());
        stats.put("totalVendors", vendorRepository.count());

        return ResponseEntity.ok(BaseApiResponse.success(stats));
    }

    // API 2: Lấy danh sách người dùng (có lọc, phân trang)
    @GetMapping("/users")
    public ResponseEntity<?> getUsers(UserFilterRequest request) {
        // Gọi service đã có logic phân trang/lọc
        return ResponseEntity.ok(BaseApiResponse.success(adminService.getUsers(request)));
    }

    // API 3: Xóa người dùng (CHỈ CÒN MỘT LẦN DUY NHẤT)
    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable int id) {
        adminService.deleteUser(id); // Gọi Service để xử lý logic xóa
        return ResponseEntity.ok(BaseApiResponse.success("Đã xóa thành công user ID: " + id));
    }
    // API 4: Tạo người dùng mới (Add User)
    @PostMapping("/users")
    public ResponseEntity<BaseApiResponse<RegisterResponse>> createUser(
            @RequestBody @Valid RegisterRequest request) {

        RegisterResponse response = adminService.createUser(request);

        return ResponseEntity
                .status(HttpStatus.CREATED) // Trả về status 201 Created
                .body(BaseApiResponse.success(response, "Đã tạo người dùng thành công"));
    }
}
