package com.example.charging_station_management.dto.request;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class DashboardResponse {
    private long totalUsers;
    private long totalVendors;
    private long totalCustomers;
    private long totalStations;
    private long totalSessions; // Tổng số phiên sạc
    private BigDecimal totalRevenue; // Tổng doanh thu

    // Dữ liệu cho biểu đồ
    private List<ChartData> revenueChartData;
    private List<ChartData> sessionChartData;
}
