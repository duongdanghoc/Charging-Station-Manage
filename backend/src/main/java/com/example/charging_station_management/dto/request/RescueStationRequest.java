package com.example.charging_station_management.dto.request;

import com.fasterxml.jackson.annotation.JsonFormat; // 👈 Nhớ import dòng này
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalTime;

@Data
public class RescueStationRequest {
    private String name;
    private String phone;
    private String email;

    // 👇 THÊM DÒNG NÀY ĐỂ FIX LỖI THỜI GIAN
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm")
    private LocalTime openTime;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm")
    private LocalTime closeTime;

    // Thông tin địa điểm
    private String addressDetail;
    private String province;
    private BigDecimal latitude;
    private BigDecimal longitude;
}
