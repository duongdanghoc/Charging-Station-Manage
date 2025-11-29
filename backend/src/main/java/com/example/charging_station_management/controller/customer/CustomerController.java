package com.example.charging_station_management.controller.customer;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class CustomerController {

    // Dashboard endpoint - khớp với frontend
    @GetMapping("/customer/dashboard/{userId}")
    public ResponseEntity<?> getDashboardData(@PathVariable String userId) {
        log.info("Getting dashboard data for user: {}", userId);

        // Profile data - khớp với DbProfile interface
        Map<String, Object> profile = Map.of(
                "id", userId,
                "name", "Nguyễn Văn A",
                "phone", "0123456789",
                "avatar_url", (Object) null, // hoặc URL thực
                "type", "CUSTOMER",
                "role", "CUSTOMER",
                "intro", "Khách hàng thân thiết"
        );

        // Recent activities - khớp với RecentActivity interface
        Map<String, Object> activity1 = Map.of(
                "id", "1",
                "type", "CHARGING",
                "description", "Sạc pin tại Trạm A - Hoàn thành",
                "timestamp", LocalDateTime.now().minusHours(2).toString()
        );

        Map<String, Object> activity2 = Map.of(
                "id", "2",
                "type", "PAYMENT",
                "description", "Thanh toán 50.000 VNĐ",
                "timestamp", LocalDateTime.now().minusDays(1).toString()
        );

        List<Map<String, Object>> recentActivities = List.of(activity1, activity2);

        Map<String, Object> response = Map.of(
                "profile", profile,
                "recentActivities", recentActivities
        );

        return ResponseEntity.ok(response);
    }

    // Profile overview endpoint - endpoint bổ sung
    @GetMapping("/profiles/{userId}/overview")
    public ResponseEntity<?> getProfileOverview(@PathVariable String userId) {
        log.info("Getting profile overview for user: {}", userId);

        Map<String, Object> profile = Map.of(
                "id", userId,
                "name", "Nguyễn Văn A",
                "phone", "0123456789",
                "avatar_url", (Object) null,
                "type", "CUSTOMER",
                "role", "CUSTOMER",
                "intro", "Khách hàng thân thiết"
        );

        Map<String, Object> response = Map.of(
                "profile", profile
        );

        return ResponseEntity.ok(response);
    }

    // Update profile endpoint
    @PutMapping("/profiles/{userId}")
    public ResponseEntity<?> updateProfile(
            @PathVariable String userId,
            @RequestBody Map<String, Object> profileData
    ) {
        log.info("Updating profile for user: {}", userId);
        log.info("Profile data: {}", profileData);

        // TODO: Implement actual update logic
        Map<String, Object> updatedProfile = Map.of(
                "id", userId,
                "name", profileData.getOrDefault("name", "Updated Name"),
                "phone", profileData.getOrDefault("phone", "0123456789"),
                "avatar_url", profileData.get("avatar_url"),
                "type", "CUSTOMER",
                "role", "CUSTOMER",
                "intro", profileData.getOrDefault("intro", "")
        );

        return ResponseEntity.ok(updatedProfile);
    }
}