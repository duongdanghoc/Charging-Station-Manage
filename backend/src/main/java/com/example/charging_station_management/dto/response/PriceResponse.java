package com.example.charging_station_management.dto.response;

import com.example.charging_station_management.entity.enums.PriceName;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
public class PriceResponse {
    private Integer id;
    private Integer chargingPoleId;
    private String chargingPoleName; // Thêm tên trụ/serial number để dễ nhìn
    private PriceName name;
    private BigDecimal price;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
    private LocalTime startTime;
    private LocalTime endTime;
    private boolean isActive; // Cờ báo giá này có đang được áp dụng hay không
}