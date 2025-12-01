package com.example.charging_station_management.dto.request;

import com.example.charging_station_management.entity.enums.ConnectorType;
import jakarta.validation.constraints.NotNull;
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
public class CreateConnectorRequest {

    @NotNull(message = "Pole ID không được để trống")
    private Integer poleId;

    @NotNull(message = "Loại đầu sạc không được để trống")
    private ConnectorType connectorType;

    @NotNull(message = "Công suất tối đa không được để trống")
    @Positive(message = "Công suất tối đa phải lớn hơn 0")
    private BigDecimal maxPower;
}