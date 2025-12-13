package com.example.charging_station_management.dto.response;

import com.example.charging_station_management.entity.enums.ConnectorStatus;
import com.example.charging_station_management.entity.enums.ConnectorType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChargingConnectorResponse {
    private Integer id;
    private ConnectorType connectorType;
    private BigDecimal maxPower;
    private ConnectorStatus status;
}
