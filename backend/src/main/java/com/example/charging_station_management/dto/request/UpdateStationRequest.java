package com.example.charging_station_management.dto.request;

import com.example.charging_station_management.entity.enums.VehicleType;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateStationRequest {

    @Size(min = 5, max = 200, message = "Tên trạm phải từ 5 đến 200 ký tự")
    private String name;

    private LocalTime openTime;
    private LocalTime closeTime;
    private VehicleType type;
    
    // Status 1: Active, 0: Inactive
    private Integer status; 

    private BigDecimal latitude;
    private BigDecimal longitude;
    private String province;
    private String addressDetail;
}
