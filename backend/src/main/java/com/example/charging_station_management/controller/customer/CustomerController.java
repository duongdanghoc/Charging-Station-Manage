package com.example.charging_station_management.controller.customer;

import com.example.charging_station_management.dto.request.UpdateProfileRequest;
import com.example.charging_station_management.dto.response.UpdateProfileResponse;
import com.example.charging_station_management.dto.response.UserInfoResponse;
import com.example.charging_station_management.service.CustomerService;
import com.example.charging_station_management.utils.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.example.charging_station_management.dto.response.StationResponse;
import com.example.charging_station_management.dto.response.ReviewResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/customer")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:8080" })
public class CustomerController {

    private final CustomerService cutomerService;

    @GetMapping("/{userId}")
    public ResponseEntity<?> getProfile(
            @PathVariable Integer userId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
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
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            if (userDetails != null && (userDetails.getId() != userId)) {
                log.warn("Access denied: User {} tried to access profile {}", userDetails.getId(), userId);
                return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }

            if (bindingResult.hasErrors()) {
                Map<String, String> errors = new HashMap<>();
                bindingResult.getFieldErrors()
                        .forEach(error -> errors.put(error.getField(), error.getDefaultMessage()));
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

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboardData(
            @RequestParam(required = false) Long userId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            Long actualUserId = userDetails != null ? userDetails.getId() : userId;

            log.info("Getting dashboard data for user: {}", actualUserId);

            Map<String, Object> profile = new HashMap<>();
            profile.put("id", String.valueOf(actualUserId));
            profile.put("name", userDetails != null ? userDetails.getName() : "Nguyễn Văn A");
            profile.put("phone", userDetails != null ? userDetails.getPhone() : "0123456789");
            profile.put("avatar_url", null);
            profile.put("type", userDetails != null ? Collections.singletonList(userDetails.getRole())
                    : Collections.singletonList("CUSTOMER"));
            profile.put("role", userDetails != null ? Collections.singletonList(userDetails.getRole())
                    : Collections.singletonList("CUSTOMER"));
            profile.put("intro", "Khách hàng thân thiết");

            Map<String, Object> activity1 = Map.of(
                    "id", "1",
                    "type", "CHARGING",
                    "description", "Sạc pin tại Trạm A - Hoàn thành",
                    "timestamp", LocalDateTime.now().minusHours(2).toString());

            Map<String, Object> activity2 = Map.of(
                    "id", "2",
                    "type", "PAYMENT",
                    "description", "Thanh toán 50.000 VNĐ",
                    "timestamp", LocalDateTime.now().minusDays(1).toString());

            List<Map<String, Object>> recentActivities = List.of(activity1, activity2);

            Map<String, Object> response = Map.of(
                    "profile", profile,
                    "recentActivities", recentActivities);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting dashboard data", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/profile/{userId}/overview")
    public ResponseEntity<?> getProfileOverview(
            @PathVariable Long userId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            log.info("Getting profile overview for user: {}", userId);

            Map<String, Object> profile = new HashMap<>();
            profile.put("id", String.valueOf(userId));
            profile.put("name", userDetails != null ? userDetails.getName() : "Nguyễn Văn A");
            profile.put("phone", userDetails != null ? userDetails.getPhone() : "0123456789");
            profile.put("avatar_url", null);
            profile.put("type", userDetails != null ? Collections.singletonList(userDetails.getRole())
                    : Collections.singletonList("CUSTOMER"));
            profile.put("role", userDetails != null ? Collections.singletonList(userDetails.getRole())
                    : Collections.singletonList("CUSTOMER"));
            profile.put("intro", "Khách hàng thân thiết");

            Map<String, Object> response = Map.of(
                    "profile", profile);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting profile overview", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/profiles/{userId}")
    public ResponseEntity<?> updateProfile(
            @PathVariable Long userId,
            @RequestBody Map<String, Object> profileData,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            log.info("Updating profile for user: {}", userId);
            log.info("Profile data: {}", profileData);

            Map<String, Object> updatedProfile = new HashMap<>();
            updatedProfile.put("id", String.valueOf(userId));
            updatedProfile.put("name", profileData.getOrDefault("name", "Updated Name"));
            updatedProfile.put("phone", profileData.getOrDefault("phone", "0123456789"));
            updatedProfile.put("avatar_url", profileData.get("avatar_url"));
            updatedProfile.put("type", Collections.singletonList("CUSTOMER"));
            updatedProfile.put("role", userDetails != null ? Collections.singletonList(userDetails.getRole())
                    : Collections.singletonList("CUSTOMER"));
            updatedProfile.put("intro", profileData.getOrDefault("intro", ""));

            return ResponseEntity.ok(updatedProfile);
        } catch (Exception e) {
            log.error("Error updating profile", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}