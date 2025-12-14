package com.example.charging_station_management.controller.vendor;

import com.example.charging_station_management.dto.request.CreateConnectorRequest;
import com.example.charging_station_management.dto.request.UpdateConnectorRequest;
import com.example.charging_station_management.dto.response.ConnectorDetailResponse;
import com.example.charging_station_management.dto.response.ConnectorResponse;
import com.example.charging_station_management.entity.enums.ConnectorStatus;
import com.example.charging_station_management.entity.enums.ConnectorType;
import com.example.charging_station_management.service.ConnectorService;
import com.example.charging_station_management.utils.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/vendor/connectors")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:8080"})
@PreAuthorize("hasRole('VENDOR')")
public class ConnectorController {

    private final ConnectorService connectorService;

    /**
     * Thêm connector mới
     */
    @PostMapping
    public ResponseEntity<?> createConnector(
            @Valid @RequestBody CreateConnectorRequest request,
            BindingResult bindingResult,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Unauthorized"));
            }

            if (bindingResult.hasErrors()) {
                Map<String, String> errors = new HashMap<>();
                bindingResult.getFieldErrors().forEach(error ->
                        errors.put(error.getField(), error.getDefaultMessage())
                );
                return ResponseEntity.badRequest().body(Map.of("errors", errors));
            }

            ConnectorResponse response = connectorService.createConnector(userDetails.getId(), request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            log.error("Error creating connector", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Cập nhật thông tin connector
     */
    @PutMapping("/{connectorId}")
    public ResponseEntity<?> updateConnector(
            @PathVariable Integer connectorId,
            @Valid @RequestBody UpdateConnectorRequest request,
            BindingResult bindingResult,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Unauthorized"));
            }

            if (bindingResult.hasErrors()) {
                Map<String, String> errors = new HashMap<>();
                bindingResult.getFieldErrors().forEach(error ->
                        errors.put(error.getField(), error.getDefaultMessage())
                );
                return ResponseEntity.badRequest().body(Map.of("errors", errors));
            }

            ConnectorResponse response = connectorService.updateConnector(
                    userDetails.getId(), connectorId, request);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error updating connector {}", connectorId, e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Cập nhật trạng thái connector
     */
    @PatchMapping("/{connectorId}/status")
    public ResponseEntity<?> updateConnectorStatus(
            @PathVariable Integer connectorId,
            @RequestParam ConnectorStatus status,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Unauthorized"));
            }

            ConnectorResponse response = connectorService.updateConnectorStatus(
                    userDetails.getId(), connectorId, status);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error updating connector status {}", connectorId, e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Xóa connector
     */
    @DeleteMapping("/{connectorId}")
    public ResponseEntity<?> deleteConnector(
            @PathVariable Integer connectorId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Unauthorized"));
            }

            connectorService.deleteConnector(userDetails.getId(), connectorId);
            return ResponseEntity.ok(Map.of("message", "Xóa connector thành công"));

        } catch (Exception e) {
            log.error("Error deleting connector {}", connectorId, e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Xem chi tiết connector
     */
    @GetMapping("/{connectorId}")
    public ResponseEntity<?> getConnectorDetail(
            @PathVariable Integer connectorId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Unauthorized"));
            }

            ConnectorDetailResponse response = connectorService.getConnectorDetail(
                    userDetails.getId(), connectorId);
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error getting connector detail {}", connectorId, e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Xem danh sách tất cả connector
     */
    @GetMapping
    public ResponseEntity<?> getAllConnectors(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error","Unauthorized"));
            }
            List<ConnectorResponse> connectors = connectorService.getAllConnectorsByVendor(
                    userDetails.getId());
            return ResponseEntity.ok(connectors);

        } catch (Exception e) {
            log.error("Error getting all connectors", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Tìm kiếm connector theo điều kiện
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchConnectors(
            @RequestParam(required = false) ConnectorType connectorType,
            @RequestParam(required = false) ConnectorStatus status,
            @RequestParam(required = false) Integer poleId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        try {
            if (userDetails == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Unauthorized"));
            }

            List<ConnectorResponse> connectors = connectorService.searchConnectors(
                    userDetails.getId(), connectorType, status, poleId);
            return ResponseEntity.ok(connectors);

        } catch (Exception e) {
            log.error("Error searching connectors", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}