package com.example.charging_station_management.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ChargingHistoryResponse(
        Integer sessionId,
        String stationName,
        String address,
        String vehiclePlate,
        LocalDateTime startTime,
        LocalDateTime endTime,
        BigDecimal energyKwh,
        BigDecimal amount,
        String sessionStatus, // COMPLETED, CHARGING...
        String paymentStatus, // PAID, PENDING, FAILED
        String paymentMethod) {
}
