package com.example.charging_station_management.controller;

import com.example.charging_station_management.dto.request.CreateStationRequest;
import com.example.charging_station_management.dto.request.UpdateStationRequest;
import com.example.charging_station_management.dto.response.ReviewResponse;
import com.example.charging_station_management.dto.response.StationResponse;
import com.example.charging_station_management.entity.enums.ConnectorType;
import com.example.charging_station_management.entity.enums.VehicleType;
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

@Slf4j
@RestController
@RequestMapping("/api/stations")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:8080" })
public class StationController {

    private final CustomerServiceImpl customerService;
    private final StationService stationService;

    @GetMapping
    public ResponseEntity<Page<StationResponse>> getAllStations(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Integer status,
            @RequestParam(required = false) VehicleType vehicleType,
            @RequestParam(required = false) ConnectorType connectorType,
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(customerService.filterStations(search, status, vehicleType, connectorType, pageable));
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
