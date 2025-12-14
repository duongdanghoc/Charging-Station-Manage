package com.example.charging_station_management.dto.request;

import com.example.charging_station_management.entity.enums.PriceName;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class CreatePriceRequest {
    @NotNull(message = "Charging Pole ID is required")
    private Integer chargingPoleId;

    @NotNull(message = "Price name is required")
    private PriceName name; // CHARGING hoặc PENALTY

    @NotNull(message = "Price value is required")
    @Positive(message = "Price must be positive")
    private BigDecimal price;

    @NotNull(message = "Effective date from is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate effectiveFrom;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate effectiveTo; // Có thể null (hiệu lực vô thời hạn)

    @NotNull(message = "Start time is required")
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime startTime;

    @NotNull(message = "End time is required")
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime endTime;
}