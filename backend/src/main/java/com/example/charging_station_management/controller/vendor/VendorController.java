package com.example.charging_station_management.controller.vendor;

import com.example.charging_station_management.dto.BaseApiResponse;
import com.example.charging_station_management.dto.response.ChartData;
import com.example.charging_station_management.dto.response.VendorRevenueStats;
import com.example.charging_station_management.entity.converters.Vendor;
import com.example.charging_station_management.service.TransactionService;
import com.example.charging_station_management.utils.CustomUserDetails;
import com.example.charging_station_management.utils.helper.UserHelper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/vendor")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:8080" })
@PreAuthorize("hasRole('VENDOR')")
public class VendorController {

    private final TransactionService transactionService;
    private final UserHelper userHelper;

    private Vendor getCurrentVendor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        var user = userHelper.findUserByEmail(email);

        if (user instanceof Vendor vendor) {
            return vendor;
        }
        throw new IllegalArgumentException("Access Denied: Người dùng không phải là Vendor");
    }

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

    @GetMapping("/stats/revenue")
    public ResponseEntity<BaseApiResponse<VendorRevenueStats>> getRevenueStats() {
        Vendor currentVendor = getCurrentVendor();
        log.info("Vendor {} requesting revenue stats", currentVendor.getId());

        VendorRevenueStats stats = transactionService.getVendorRevenueStats(currentVendor.getId());

        return ResponseEntity.ok(BaseApiResponse.success(stats, "Lấy thống kê doanh thu thành công"));
    }

    @GetMapping("/stats/chart")
    public ResponseEntity<BaseApiResponse<List<ChartData>>> getChartData(
            @RequestParam(defaultValue = "7") int days) { // Mặc định 7 ngày

        Vendor currentVendor = getCurrentVendor();

        List<ChartData> data = transactionService.getVendorChartData(currentVendor.getId(), days);
        return ResponseEntity.ok(BaseApiResponse.success(data, "Lấy dữ liệu biểu đồ thành công"));
    }

    @GetMapping("/stats/chart/range")
    public ResponseEntity<BaseApiResponse<List<ChartData>>> getChartDataByRange(
            @RequestParam("from") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam("to") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        log.info("API Hit: /stats/chart/range with from={}, to={}", from, to);

        Vendor currentVendor = getCurrentVendor();

        List<ChartData> data = transactionService.getVendorChartDataByDateRange(currentVendor.getId(), from, to);
        return ResponseEntity.ok(BaseApiResponse.success(data, "Lấy dữ liệu biểu đồ theo khoảng thời gian thành công"));
    }
}
