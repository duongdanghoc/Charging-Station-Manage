package com.example.charging_station_management.dto;

import com.example.charging_station_management.entity.enums.ConnectorType;
import com.example.charging_station_management.entity.enums.VehicleType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VehicleDTO {
    private Integer id;
    private VehicleType vehicleType;
    private String brand;
    private String model;
    private String licensePlate;
    private BigDecimal batteryCapacity;
    private ConnectorType connectorType;
    private boolean hasActiveSession;
}
