package com.example.charging_station_management.controller.admin;

import com.example.charging_station_management.dto.request.ChargingSessionFilterRequest;
import com.example.charging_station_management.dto.response.ChargingSessionDetailResponse;
import com.example.charging_station_management.entity.enums.SessionStatus;
import com.example.charging_station_management.service.ChargingSessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:8080" })
@PreAuthorize("hasRole('ADMIN')")
public class AdminChargingSessionController {

    private final ChargingSessionService chargingSessionService;

    @GetMapping("/charging-sessions")
    public ResponseEntity<?> getAllChargingSessions(
            @RequestParam(required = false) Integer customerId,
            @RequestParam(required = false) Integer stationId,
            @RequestParam(required = false) SessionStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTimeFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startTimeTo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTimeFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endTimeTo,
            @RequestParam(required = false) String customerName,
            @RequestParam(required = false) String stationName,
            @RequestParam(required = false) String licensePlate,
            @PageableDefault(size = 10, page = 0, sort = "startTime", direction = Sort.Direction.DESC) Pageable pageable) {

        try {
            // Build filter request
            ChargingSessionFilterRequest filterRequest = ChargingSessionFilterRequest.builder()
                    .customerId(customerId)
                    .stationId(stationId)
                    .status(status)
                    .startTimeFrom(startTimeFrom)
                    .startTimeTo(startTimeTo)
                    .endTimeFrom(endTimeFrom)
                    .endTimeTo(endTimeTo)
                    .customerName(customerName)
                    .stationName(stationName)
                    .licensePlate(licensePlate)
                    .build();
            Page<ChargingSessionDetailResponse> sessions = chargingSessionService.getAllChargingSessions(filterRequest,
                    pageable);

            if (!sessions.isEmpty()) {
                log.warn("⚠NO SESSIONS FOUND!");
                log.warn("Possible reasons:");
                log.warn("  1. Database is empty (no charging_session records)");
                log.warn("  2. Filter is too strict (no matching records)");
                log.warn("  3. Query has issues (check ChargingSessionService)");
            }
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Successfully retrieved charging sessions");
            response.put("data", createPageResponse(sessions));
            response.put("timestamp", LocalDateTime.now());

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to retrieve charging sessions");
            errorResponse.put("error", e.getMessage());
            errorResponse.put("timestamp", LocalDateTime.now());

            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/charging-sessions/{sessionId}")
    public ResponseEntity<?> getChargingSessionById(@PathVariable Integer sessionId) {
        try {
            log.info("Admin requesting charging session detail - sessionId: {}", sessionId);

            ChargingSessionDetailResponse session = chargingSessionService.getChargingSessionById(sessionId);

            log.info("Found session: {}", session);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Successfully retrieved charging session");
            response.put("data", session);
            response.put("timestamp", LocalDateTime.now());

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            log.error("Error retrieving charging session: {}", sessionId, e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            errorResponse.put("sessionId", sessionId);
            errorResponse.put("timestamp", LocalDateTime.now());

            return ResponseEntity.status(404).body(errorResponse);

        } catch (Exception e) {
            log.error("Unexpected error retrieving charging session: {}", sessionId, e);

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to retrieve charging session");
            errorResponse.put("error", e.getMessage());
            errorResponse.put("timestamp", LocalDateTime.now());

            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    /**
     * Tạo cấu trúc page response chuẩn cho FE
     */
    private Map<String, Object> createPageResponse(Page<ChargingSessionDetailResponse> page) {
        Map<String, Object> pageResponse = new HashMap<>();

        pageResponse.put("content", page.getContent());
        pageResponse.put("pageNumber", page.getNumber());
        pageResponse.put("pageSize", page.getSize());
        pageResponse.put("totalElements", page.getTotalElements());
        pageResponse.put("totalPages", page.getTotalPages());
        pageResponse.put("last", page.isLast());
        pageResponse.put("first", page.isFirst());
        pageResponse.put("empty", page.isEmpty());
        pageResponse.put("numberOfElements", page.getNumberOfElements());

        return pageResponse;
    }
}