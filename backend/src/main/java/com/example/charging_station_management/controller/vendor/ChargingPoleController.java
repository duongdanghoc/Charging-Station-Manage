package com.example.charging_station_management.controller.vendor;

import com.example.charging_station_management.dto.BaseApiResponse;
import com.example.charging_station_management.dto.request.CreateChargingPoleRequest;
import com.example.charging_station_management.dto.request.UpdateChargingPoleRequest;
import com.example.charging_station_management.dto.response.ChargingPoleResponse;
import com.example.charging_station_management.service.ChargingPoleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vendor/charging-poles")
@RequiredArgsConstructor
public class ChargingPoleController {

    private final ChargingPoleService chargingPoleService;

    // API thêm mới: POST /api/vendor/charging-poles
    @PostMapping
    public ResponseEntity<BaseApiResponse<ChargingPoleResponse>> createChargingPole(
            @Valid @RequestBody CreateChargingPoleRequest request) {
        
        ChargingPoleResponse response = chargingPoleService.createChargingPole(request);
        return ResponseEntity.ok(BaseApiResponse.success(response, "Thêm trụ sạc thành công"));
    }

    // API xóa: DELETE /api/vendor/charging-poles/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<BaseApiResponse<Void>> deleteChargingPole(@PathVariable Integer id) {
        chargingPoleService.deleteChargingPole(id);
        return ResponseEntity.ok(BaseApiResponse.success(null, "Xóa trụ sạc thành công"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BaseApiResponse<ChargingPoleResponse>> updateChargingPole(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateChargingPoleRequest request) {
        
        ChargingPoleResponse response = chargingPoleService.updateChargingPole(id, request);
        return ResponseEntity.ok(BaseApiResponse.success(response, "Cập nhật trụ sạc thành công"));
    }
}