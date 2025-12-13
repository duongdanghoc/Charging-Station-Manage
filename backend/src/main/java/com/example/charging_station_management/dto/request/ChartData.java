package com.example.charging_station_management.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ChartData {
    private String name; // Ví dụ: "Tháng 1", "2024-05-20"
    private Number value; // Doanh thu hoặc số lượng
}
