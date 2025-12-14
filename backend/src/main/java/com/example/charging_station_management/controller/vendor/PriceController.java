package com.example.charging_station_management.controller.vendor;

import com.example.charging_station_management.dto.BaseApiResponse;
import com.example.charging_station_management.dto.request.CreatePriceRequest;
import com.example.charging_station_management.dto.request.UpdatePriceRequest;
import com.example.charging_station_management.dto.response.PriceResponse;
import com.example.charging_station_management.service.PriceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendor/prices")
@RequiredArgsConstructor
@PreAuthorize("hasRole('VENDOR')") // Đảm bảo chỉ Vendor mới gọi được
public class PriceController {

    private final PriceService priceService;

    @PostMapping
    public ResponseEntity<BaseApiResponse<PriceResponse>> createPrice(@Valid @RequestBody CreatePriceRequest request) {
        PriceResponse response = priceService.createPrice(request);
        return ResponseEntity.ok(BaseApiResponse.success(response, "Price configuration created successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BaseApiResponse<PriceResponse>> updatePrice(@PathVariable Integer id,
                                                                      @Valid @RequestBody UpdatePriceRequest request) {
        PriceResponse response = priceService.updatePrice(id, request);
        return ResponseEntity.ok(BaseApiResponse.success(response, "Price configuration updated successfully"));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<BaseApiResponse<Void>> deletePrice(@PathVariable Integer id) {
        priceService.deletePrice(id);
        return ResponseEntity.ok(BaseApiResponse.success(null, "Price configuration deleted successfully"));
    }

    @GetMapping("/pole/{poleId}")
    public ResponseEntity<BaseApiResponse<List<PriceResponse>>> getPricesByPole(@PathVariable Integer poleId) {
        List<PriceResponse> responses = priceService.getPricesByPole(poleId);
        return ResponseEntity.ok(BaseApiResponse.success(responses, "Prices retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BaseApiResponse<PriceResponse>> getPriceById(@PathVariable Integer id) {
        PriceResponse response = priceService.getPriceById(id);
        return ResponseEntity.ok(BaseApiResponse.success(response, "Price detail retrieved successfully"));
    }
}