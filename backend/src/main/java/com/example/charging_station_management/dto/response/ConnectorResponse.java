package com.example.charging_station_management.dto.response;

import com.example.charging_station_management.entity.enums.ConnectorStatus;
import com.example.charging_station_management.entity.enums.ConnectorType;

import java.math.BigDecimal;

public record ConnectorResponse(
        Integer id,
        Integer poleId,
        String poleName,
        Integer stationId,
        String stationName,
        ConnectorType connectorType,
        BigDecimal maxPower,
        ConnectorStatus status,
        Boolean isInUse
) {}