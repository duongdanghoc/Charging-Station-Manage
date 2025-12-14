package com.example.charging_station_management.dto.response;

import com.example.charging_station_management.entity.enums.ConnectorStatus;
import com.example.charging_station_management.entity.enums.ConnectorType;
import com.example.charging_station_management.entity.enums.SessionStatus;
import com.example.charging_station_management.entity.enums.VehicleType;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Builder
public record ChargingSessionDetailResponse(
        Integer sessionId,
        LocalDateTime startTime,
        LocalDateTime endTime,
        BigDecimal energyKwh,
        BigDecimal cost,
        SessionStatus status,

        // Customer info
        Integer customerId,
        String customerName,
        String customerEmail,
        String customerPhone,

        // Vehicle info
        Integer vehicleId,
        String licensePlate,
        String vehicleBrand,
        String vehicleModel,
        VehicleType vehicleType,
        ConnectorType vehicleConnectorType,
        BigDecimal batteryCapacity,

        // Station info
        Integer stationId,
        String stationName,
        String stationProvince,
        String stationAddress,
        String vendorName,

        // Charging pole info
        Integer poleId,
        String poleManufacturer,
        BigDecimal poleMaxPower,

        // Connector info
        Integer connectorId,
        ConnectorType connectorType,
        BigDecimal connectorMaxPower,
        ConnectorStatus connectorStatus,

        // Transaction info (if exists)
        Integer transactionId,
        String paymentMethod,
        String paymentStatus,
        LocalDateTime paymentTime
) {}