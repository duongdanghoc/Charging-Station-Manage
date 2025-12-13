package com.example.charging_station_management.controller.admin;
import com.example.charging_station_management.dto.BaseApiResponse;
import com.example.charging_station_management.dto.request.RegisterRequest;
import com.example.charging_station_management.dto.request.RescueStationRequest;
import com.example.charging_station_management.dto.request.UserFilterRequest;
import com.example.charging_station_management.dto.response.RegisterResponse;
import com.example.charging_station_management.repository.CustomerRepository;
import com.example.charging_station_management.repository.UserRepository;
import com.example.charging_station_management.repository.VendorRepository;
import com.example.charging_station_management.service.AdminService; // <-- Đảm bảo đã import
import org.springframework.data.domain.Pageable; // <-- Import Pageable
import org.springframework.data.web.PageableDefault; // <-- Hỗ trợ mặc định phân trang
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

  // --- API 5: Xem danh sách Trạm sạc của một Vendor cụ thể (MỚI BỔ SUNG) ---
  // URL ví dụ: GET /api/admin/vendors/5/stations?page=0&size=10
  @GetMapping("/vendors/{vendorId}/stations")
  public ResponseEntity<?> getStationsByVendor(
      @PathVariable Integer vendorId,
      @PageableDefault(size = 10) Pageable pageable) {

    return ResponseEntity.ok(BaseApiResponse.success(
        adminService.getStationsByVendor(vendorId, pageable)));
  }

  // --- API 6: Xem danh sách Xe điện của một Customer cụ thể (MỚI BỔ SUNG) ---
  // URL ví dụ: GET /api/admin/customers/8/vehicles?page=0&size=10
  @GetMapping("/customers/{customerId}/vehicles")
  public ResponseEntity<?> getVehiclesByCustomer(
      @PathVariable Integer customerId,
      @PageableDefault(size = 10) Pageable pageable) {

    return ResponseEntity.ok(BaseApiResponse.success(
        adminService.getVehiclesByCustomer(customerId, pageable)));
  }
  // Sửa lại API /stats cũ hoặc tạo mới
  @GetMapping("/dashboard-stats")
  public ResponseEntity<?> getDashboardStats() {
      return ResponseEntity.ok(BaseApiResponse.success(adminService.getDashboardStats()));
  }
  // --- API QUẢN LÝ TRẠM CỨU HỘ ---

    @GetMapping("/rescue-stations")
    public ResponseEntity<?> getRescueStations(
            @RequestParam(required = false) String keyword, // Nhận từ khóa tìm kiếm (có thể null)
            @PageableDefault(size = 10) Pageable pageable   // Nhận trang số mấy, mặc định 10 dòng/trang
    ) {
        // Gọi hàm mới trong Service (trả về Page thay vì List)
        return ResponseEntity.ok(BaseApiResponse.success(adminService.getRescueStations(keyword, pageable)));
    }

    @PostMapping("/rescue-stations")
    public ResponseEntity<?> createRescueStation(@RequestBody RescueStationRequest request) {
        return ResponseEntity.ok(BaseApiResponse.success(adminService.createRescueStation(request)));
    }

    @DeleteMapping("/rescue-stations/{id}")
    public ResponseEntity<?> deleteRescueStation(@PathVariable Integer id) {
        adminService.deleteRescueStation(id);
        return ResponseEntity.ok(BaseApiResponse.success("Đã xóa trạm cứu hộ"));
    }
    @PutMapping("/rescue-stations/{id}")
    public ResponseEntity<?> updateRescueStation(
            @PathVariable Integer id,
            @RequestBody RescueStationRequest request
    ) {
        return ResponseEntity.ok(BaseApiResponse.success(adminService.updateRescueStation(id, request)));
    }
}
