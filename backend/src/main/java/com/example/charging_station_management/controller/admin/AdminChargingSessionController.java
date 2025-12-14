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
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:8080" })
@PreAuthorize("hasRole('ADMIN')")
public class AdminChargingSessionController {

    private final ChargingSessionService changingSessionService;

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
            log.info(
                    "Admin requesting charging sessions - customerId: {}, stationId: {}, status: {}, page: {}, size: {}",
                    customerId, stationId, status, pageable.getPageNumber(), pageable.getPageSize());

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

            Page<ChargingSessionDetailResponse> sessions = changingSessionService.getAllChargingSessions(filterRequest,
                    pageable);

            log.info("Successfully retrieved {} charging sessions (total: {})",
                    sessions.getNumberOfElements(), sessions.getTotalElements());

            return ResponseEntity.ok(sessions);

        } catch (Exception e) {
            log.error("Error retrieving charging sessions", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to retrieve charging sessions: " + e.getMessage()));
        }
    }

    @GetMapping("/charging-sessions/{sessionId}")
    public ResponseEntity<?> getChargingSessionById(@PathVariable Integer sessionId) {
        try {
            log.info("Admin requesting charging session detail - sessionId: {}", sessionId);

            ChargingSessionDetailResponse session = changingSessionService.getChargingSessionById(sessionId);

            log.info("Successfully retrieved charging session: {}", sessionId);

            return ResponseEntity.ok(session);

        } catch (RuntimeException e) {
            log.error("Error retrieving charging session: {}", sessionId, e);
            return ResponseEntity.status(404)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error retrieving charging session: {}", sessionId, e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to retrieve charging session: " + e.getMessage()));
        }
    }

}
