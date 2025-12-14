package com.example.charging_station_management.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChartData {
    private String date; // Dạng "dd/MM"
    private BigDecimal revenue;
    private Long sessions;
}
