package com.example.charging_station_management.controller;

import com.example.charging_station_management.dto.CreateVehicleRequest;
import com.example.charging_station_management.dto.UpdateVehicleRequest;
import com.example.charging_station_management.dto.VehicleDTO;
import com.example.charging_station_management.utils.CustomUserDetails;
import com.example.charging_station_management.service.VehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/vehicles")
@RequiredArgsConstructor
public class VehicleController {

    private final VehicleService vehicleService;

    @GetMapping
    public ResponseEntity<List<VehicleDTO>> getCustomerVehicles(Authentication authentication) {
        log.info("GET /api/vehicles - Request received");
        try {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            log.info("Authenticated user ID: {}, Name: {}", userDetails.getId(), userDetails.getName());

            List<VehicleDTO> vehicles = vehicleService.getCustomerVehicles(userDetails.getId());
            log.info("Returning {} vehicles for user {}", vehicles.size(), userDetails.getId());

            return ResponseEntity.ok(vehicles);
        } catch (Exception e) {
            log.error("Error in getCustomerVehicles: {}", e.getMessage(), e);
            throw e;
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<VehicleDTO> getVehicleById(
            @PathVariable Integer id,
            Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        VehicleDTO vehicle = vehicleService.getVehicleById(id, userDetails.getId());
        return ResponseEntity.ok(vehicle);
    }

    @PostMapping
    public ResponseEntity<VehicleDTO> createVehicle(
            @Valid @RequestBody CreateVehicleRequest request,
            Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        VehicleDTO vehicle = vehicleService.createVehicle(request, userDetails.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(vehicle);
    }

    @PutMapping("/{id}")
    public ResponseEntity<VehicleDTO> updateVehicle(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateVehicleRequest request,
            Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        VehicleDTO vehicle = vehicleService.updateVehicle(id, request, userDetails.getId());
        return ResponseEntity.ok(vehicle);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVehicle(
            @PathVariable Integer id,
            Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        vehicleService.deleteVehicle(id, userDetails.getId());
        return ResponseEntity.noContent().build();
    }
}
