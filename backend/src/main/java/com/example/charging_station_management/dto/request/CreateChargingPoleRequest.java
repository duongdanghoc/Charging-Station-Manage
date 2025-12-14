package com.example.charging_station_management.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateChargingPoleRequest {

    @NotNull(message = "Station ID is required")
    private Integer stationId;

    @NotBlank(message = "Manufacturer name is required")
    private String manufacturer;

    @NotNull(message = "Max power is required")
    @Positive(message = "Max power must be positive")
    private Double maxPower;

    // 👇 ĐÃ SỬA: Thêm validation để tránh lỗi limit = 0 hoặc null
    @NotNull(message = "Max connectors (capacity) is required")
    @Min(value = 1, message = "Charging pole must have at least 1 connector slot")
    private Integer maxConnectors;

    private LocalDate installDate; // Có thể null, xử lý logic ở Service
}