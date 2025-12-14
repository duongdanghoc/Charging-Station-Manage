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
    
    // 👇 Phần đã giải quyết conflict (Giữ lại đủ 4 trường này là được)
    // Tôi giữ theo thứ tự của HEAD (nhánh bạn đang làm)
    private String status2;
    private Integer ports;
    private BigDecimal revenue;
    private Integer poles;
}