package com.example.charging_station_management.dto.response;

import java.math.BigDecimal;

public record SessionSummary(
        Integer sessionId,
        String vehiclePlate,
        String startTime,
        String endTime,
        BigDecimal energyKwh,
        BigDecimal cost,
        String status
) {
}
