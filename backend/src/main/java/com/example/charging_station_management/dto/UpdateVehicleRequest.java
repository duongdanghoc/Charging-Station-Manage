package com.example.charging_station_management.dto;

import com.example.charging_station_management.entity.enums.ConnectorType;
import com.example.charging_station_management.entity.enums.VehicleType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateVehicleRequest {
    
    @NotNull(message = "Loại xe không được để trống")
    private VehicleType vehicleType;
    
    @NotBlank(message = "Hãng xe không được để trống")
    private String brand;
    
    @NotBlank(message = "Model không được để trống")
    private String model;
    
    private String licensePlate;
    
    @NotNull(message = "Dung lượng pin không được để trống")
    @DecimalMin(value = "0.1", message = "Dung lượng pin phải lớn hơn 0")
    private BigDecimal batteryCapacity;
    
    @NotNull(message = "Loại cổng sạc không được để trống")
    private ConnectorType connectorType;
}
