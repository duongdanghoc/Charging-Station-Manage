package com.example.charging_station_management.dto.response;

import com.example.charging_station_management.entity.enums.PaymentMethod;
import com.example.charging_station_management.entity.enums.PaymentStatus;
import com.example.charging_station_management.entity.enums.SessionStatus;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Builder
public record TransactionDetailResponse(
        // Transaction info
        Integer transactionId,
        BigDecimal amount,
        PaymentMethod paymentMethod,
        PaymentStatus paymentStatus,
        String bankName,
        String accountNumber,
        LocalDateTime paymentTime,
        LocalDateTime createdAt,

        // Customer info
        Integer customerId,
        String customerName,
        String customerEmail,
        String customerPhone,

        // Charging session info
        Integer sessionId,
        LocalDateTime sessionStartTime,
        LocalDateTime sessionEndTime,
        BigDecimal energyKwh,
        BigDecimal sessionCost,
        SessionStatus sessionStatus,

        // Vehicle info
        Integer vehicleId,
        String licensePlate,
        String vehicleBrand,
        String vehicleModel,

        // Station info
        Integer stationId,
        String stationName,
        String stationProvince,
        String stationAddress,
        String vendorName,

        // Connector info
        Integer connectorId,
        String connectorType,

        // Pole info
        Integer poleId,
        String poleManufacturer
) {}
