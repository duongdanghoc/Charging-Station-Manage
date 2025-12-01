package com.example.charging_station_management.controller;

import com.example.charging_station_management.dto.response.ReviewResponse;
import com.example.charging_station_management.dto.response.StationResponse;
import com.example.charging_station_management.service.CustomerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/stations")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:8080" })
public class StationController {

    private final CustomerService customerService;

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
}
