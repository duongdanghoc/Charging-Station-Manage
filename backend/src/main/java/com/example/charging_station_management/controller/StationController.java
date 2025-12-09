package com.example.charging_station_management.controller;

import com.example.charging_station_management.dto.request.CreateStationRequest;
import com.example.charging_station_management.dto.request.UpdateStationRequest;
import com.example.charging_station_management.dto.response.ReviewResponse;
import com.example.charging_station_management.dto.response.StationResponse;
import com.example.charging_station_management.entity.enums.StationStatus;
import com.example.charging_station_management.service.CustomerService;
import com.example.charging_station_management.service.StationService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/stations") // SỬA LẠI: Dùng chung cho cả hệ thống
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Hoặc cấu hình cụ thể domain frontend của bạn
public class StationController {

    private final CustomerService customerService;
    private final StationService stationService;

    /* =================================================================
       1. PUBLIC / CUSTOMER API (Ai cũng truy cập được)
       Url: /api/stations
    ================================================================= */

    @GetMapping
    public ResponseEntity<Page<StationResponse>> getAllStations(@PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(customerService.getAllStations(pageable));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<StationResponse>> searchStations(
            @RequestParam String query,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(customerService.searchStations(query, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StationResponse> getStationById(@PathVariable Integer id) {
        return ResponseEntity.ok(customerService.getStationById(id));
    }

    @GetMapping("/{id}/reviews")
    public ResponseEntity<Page<ReviewResponse>> getStationReviews(
            @PathVariable Integer id,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(customerService.getStationReviews(id, pageable));
    }

    /* =================================================================
       2. VENDOR API (Cần quyền VENDOR)
       Url: /api/stations
    ================================================================= */

    @PostMapping
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<StationResponse> createStation(@Valid @RequestBody CreateStationRequest request) {
        return ResponseEntity.ok(stationService.createStation(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<StationResponse> updateStation(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateStationRequest request) {
        return ResponseEntity.ok(stationService.updateStation(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Void> deleteStation(@PathVariable Integer id) {
        stationService.deleteStation(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Page<StationResponse>> getMyStations(
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(stationService.getMyStations(pageable));
    }

    /* =================================================================
       3. ADMIN API (Cần quyền ADMIN)
       Url: /api/stations/admin/...
    ================================================================= */

    // Lưu ý: Url sẽ là /api/stations/admin/all
    @GetMapping("/admin/all")
    //@PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<StationResponse>> getAllStationsForAdmin(
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(stationService.getAllStations(pageable));
    }

    // Đổi trạng thái trạm
    @PatchMapping("/admin/{id}/status")
    //@PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> updateStatus(@PathVariable Integer id, @RequestParam String status) {
        Integer statusInt = StationStatus.fromString(status).getValue();
        stationService.updateStationStatus(id, statusInt);
        return ResponseEntity.ok().build();
    }

    // Xóa trạm quyền Admin
    @DeleteMapping("/admin/{id}")
    //@PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> adminDeleteStation(@PathVariable Integer id) {
        stationService.adminDeleteStation(id);
        return ResponseEntity.noContent().build();
    }
}
