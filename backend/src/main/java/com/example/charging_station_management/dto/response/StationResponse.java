package com.example.charging_station_management.dto.response;

import com.example.charging_station_management.entity.enums.VehicleType;
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
public class StationResponse {
    private Integer id;
    private String name;
    private String address;
    private String city;
    private Double latitude;
    private Double longitude;
    private LocalTime openTime;
    private LocalTime closeTime;
    private Integer status;
    private VehicleType type;
    private String vendorName;
    private Double averageRating;
    private Integer totalRatings;
    
    // Các trường thống kê
    private String status2;
    private BigDecimal revenue;
    private Integer poles;       // Số lượng trụ
    private Integer ports;       // Tổng số đầu sạc
    private Integer activePorts; // 👇 MỚI: Số đầu sạc sẵn sàng (AVAILABLE)
}