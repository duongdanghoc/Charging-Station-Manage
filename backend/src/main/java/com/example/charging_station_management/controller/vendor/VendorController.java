package com.example.charging_station_management.controller.vendor;

import com.example.charging_station_management.utils.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/vendor")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:8080" })
@PreAuthorize("hasRole('VENDOR')")
public class VendorController {

    @GetMapping("/profile/{userId}/overview")
    public ResponseEntity<?> getProfileOverview(
            @PathVariable Long userId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            log.info("Getting profile overview for vendor: {}", userId);

            if (userDetails != null && (userDetails.getId() != userId.intValue())) {
                 log.warn("Access denied: User {} tried to access profile {}", userDetails.getId(), userId);
                 return ResponseEntity.status(403).body(Map.of("error", "Access denied"));
            }

            Map<String, Object> profile = new HashMap<>();
            profile.put("id", String.valueOf(userId));
            profile.put("name", userDetails != null ? userDetails.getName() : "Vendor Name");
            profile.put("phone", userDetails != null ? userDetails.getPhone() : "0123456789");
            profile.put("avatar_url", null);
            profile.put("type", userDetails != null ? Collections.singletonList(userDetails.getRole())
                    : Collections.singletonList("VENDOR"));
            profile.put("role", userDetails != null ? Collections.singletonList(userDetails.getRole())
                    : Collections.singletonList("VENDOR"));
            profile.put("intro", "Đối tác cung cấp trạm sạc");

            Map<String, Object> response = Map.of(
                    "profile", profile);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error getting profile overview", e);
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}
