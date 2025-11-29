package com.example.charging_station_management.controller.customer;

import com.example.charging_station_management.dto.request.UpdateProfileRequest;
import com.example.charging_station_management.dto.response.UpdateProfileResponse;
import com.example.charging_station_management.dto.response.UserInfoResponse;
import com.example.charging_station_management.service.CustomerService;
import com.example.charging_station_management.utils.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/cutomer")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
public class CustomerController {

    private final CustomerService cutomerService;

    @GetMapping("/{userId}")
    public ResponseEntity<?> getProfile(
            @PathVariable Integer userId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        try {
            if (userDetails != null && (userDetails.getId() != userId)) {
                log.warn("Access denied: User {} tried to access profile {}", userDetails.getId(), userId);
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }
            UserInfoResponse userInfoResponse = cutomerService.getProfile(userId);
            return ResponseEntity.ok(userInfoResponse);
        } catch (RuntimeException e) {
            log.error("Error getting profile for user {}", userId, e);
            return ResponseEntity.status(404).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{userId}")
    public ResponseEntity<?> updateProfile(
            @PathVariable Integer userId,
            @Valid @RequestBody UpdateProfileRequest request,
            BindingResult bindingResult,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        try {
            if (userDetails != null && (userDetails.getId() != userId)) {
                log.warn("Access denied: User {} tried to access profile {}", userDetails.getId(), userId);
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }

            if (bindingResult.hasErrors()) {
                Map<String, String> errors = new HashMap<>();
                bindingResult.getFieldErrors().forEach(error ->
                        errors.put(error.getField(), error.getDefaultMessage())
                );
                log.warn("Validation errors for user {}: {}", userId, errors);
                return ResponseEntity.badRequest().body(Map.of("errors", errors));
            }

            UpdateProfileResponse response = cutomerService.updateProfile(userId, request);
            log.info("Profile updated successfully for user {}", userId);

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            log.error("Error updating profile for user {}", userId, e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}