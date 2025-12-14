package com.example.charging_station_management.dto.request;

import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class UpdateChargingPoleRequest {
    private String manufacturer;
    private BigDecimal maxPower;
    private LocalDate installDate;
    private Integer maxConnectors;
}