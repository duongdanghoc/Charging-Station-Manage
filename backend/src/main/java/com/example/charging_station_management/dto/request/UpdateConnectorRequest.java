package com.example.charging_station_management.dto.request;

import com.example.charging_station_management.entity.enums.ConnectorStatus;
import com.example.charging_station_management.entity.enums.ConnectorType;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateConnectorRequest {

    private ConnectorType connectorType;

    @Positive(message = "Công suất tối đa phải lớn hơn 0")
    private BigDecimal maxPower;

    private ConnectorStatus status;
}