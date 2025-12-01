package com.example.charging_station_management.dto.response;

import com.example.charging_station_management.entity.enums.ConnectorStatus;
import com.example.charging_station_management.entity.enums.ConnectorType;

import java.math.BigDecimal;
import java.util.List;

public record ConnectorDetailResponse(
        Integer id,
        Integer poleId,
        String poleManufacturer,
        BigDecimal poleMaxPower,
        Integer stationId,
        String stationName,
        String stationAddress,
        ConnectorType connectorType,
        BigDecimal maxPower,
        ConnectorStatus status,
        Integer totalSessions,
        List<SessionSummary> recentSessions
) {}