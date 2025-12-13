package com.example.charging_station_management.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChargingPoleResponse {
    private Integer id;
    private String manufacturer;
    private BigDecimal maxPower;
    private Integer connectorCount;
    private LocalDate installDate;
    private List<ChargingConnectorResponse> connectors;
}
