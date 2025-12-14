package com.example.charging_station_management.dto.request;

import com.example.charging_station_management.entity.enums.PriceName;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
public class UpdatePriceRequest {
    private PriceName name;
    
    @Positive(message = "Price must be positive")
    private BigDecimal price;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate effectiveFrom;
    
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate effectiveTo;
    
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime startTime;
    
    @JsonFormat(pattern = "HH:mm:ss")
    private LocalTime endTime;
}