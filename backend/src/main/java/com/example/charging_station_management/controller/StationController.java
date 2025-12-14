package com.example.charging_station_management.controller;

import com.example.charging_station_management.dto.request.CreateStationRequest;
import com.example.charging_station_management.dto.request.UpdateStationRequest;
// 👇 1. Import đúng BaseApiResponse (dto package)
import com.example.charging_station_management.dto.BaseApiResponse;
import com.example.charging_station_management.dto.response.ChargingPoleResponse;

import com.example.charging_station_management.dto.response.ReviewResponse;
import com.example.charging_station_management.dto.response.StationResponse;
import com.example.charging_station_management.entity.enums.VehicleType;
// 👇 2. Import ChargingPoleService
import com.example.charging_station_management.service.ChargingPoleService;
import com.example.charging_station_management.service.StationService;
import com.example.charging_station_management.service.impl.CustomerServiceImpl;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/stations")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:8080" })
public class StationController {

    private final CustomerServiceImpl customerService;
    private final StationService stationService;
    
    // 👇 3. Khai báo Service lấy dữ liệu trụ
    private final ChargingPoleService chargingPoleService;

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

    // 👇👇👇 4. ENDPOINT LẤY DANH SÁCH TRỤ (ĐÃ SỬA CHUẨN) 👇👇👇
    @GetMapping("/{id}/poles")
    public ResponseEntity<BaseApiResponse<List<ChargingPoleResponse>>> getPolesByStationId(@PathVariable Integer id) {
        // Gọi service lấy danh sách
        List<ChargingPoleResponse> poles = chargingPoleService.getAllPolesByStationId(id);
        
        // Sử dụng hàm static success(data, message) để trả về đúng định dạng
        return ResponseEntity.ok(BaseApiResponse.success(poles, "Lấy danh sách trụ thành công"));
    }
    // 👆👆👆 KẾT THÚC PHẦN SỬA 👆👆👆

    @GetMapping("/{id}/reviews")
    public ResponseEntity<Page<ReviewResponse>> getStationReviews(
            @PathVariable Integer id,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(customerService.getStationReviews(id, pageable));
    }

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
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) VehicleType type,
            @PageableDefault(size = 10) Pageable pageable) {

        return ResponseEntity.ok(stationService.getMyStations(search, status, type, pageable));
    }
}