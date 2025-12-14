package com.example.charging_station_management.dto.mapper;

import com.example.charging_station_management.dto.response.VendorRevenueStats;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Mapper(componentModel = "spring")
public interface VendorStatsMapper {
    @Mapping(target = "dailyRevenue", source = "daily", defaultValue = "0")
    @Mapping(target = "monthlyRevenue", source = "thisMonth", defaultValue = "0")
    @Mapping(target = "lastMonthRevenue", source = "lastMonth", defaultValue = "0")
    @Mapping(target = "monthlyGrowth", expression = "java(calculateGrowth(thisMonth, lastMonth))")
    VendorRevenueStats toRevenueStats(BigDecimal daily, BigDecimal thisMonth, BigDecimal lastMonth);

    @Named("calculateGrowth")
    default Double calculateGrowth(BigDecimal current, BigDecimal previous) {
        BigDecimal safeCurrent = (current != null) ? current : BigDecimal.ZERO;
        BigDecimal safePrevious = (previous != null) ? previous : BigDecimal.ZERO;

        if (safePrevious.compareTo(BigDecimal.ZERO) > 0) {
            // Công thức: ((Mới - Cũ) / Cũ) * 100
            return safeCurrent.subtract(safePrevious)
                    .divide(safePrevious, 4, RoundingMode.HALF_UP)
                    .doubleValue() * 100;
        } else if (safeCurrent.compareTo(BigDecimal.ZERO) > 0) {
            // Tháng trước = 0, tháng này có doanh thu -> Tăng trưởng 100%
            return 100.0;
        }
        // Cả 2 đều bằng 0 hoặc giảm về 0
        return 0.0;
    }
}
