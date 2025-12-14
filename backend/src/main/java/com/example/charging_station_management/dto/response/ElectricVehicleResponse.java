package com.example.charging_station_management.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ElectricVehicleResponse {

    private Integer id;

    // Thông tin Customer sở hữu (chỉ lấy ID và Tên để tránh vòng lặp vô hạn)
    private Integer customerId;
    private String customerName;

    private String brand;
    private String model;
    private String licensePlate;
    private BigDecimal batteryCapacity;

    // Trả về String của Enum để Frontend dễ hiển thị
    private String vehicleType;
    private String connectorType;
}
