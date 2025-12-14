package com.example.charging_station_management.dto.response;

import lombok.Builder;
import java.math.BigDecimal;

@Builder
public record VendorRevenueStats(
        BigDecimal dailyRevenue,
        BigDecimal monthlyRevenue,
        Double monthlyGrowth,
        BigDecimal lastMonthRevenue) {
}
