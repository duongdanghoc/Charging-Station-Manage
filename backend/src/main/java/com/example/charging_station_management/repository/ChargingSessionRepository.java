package com.example.charging_station_management.repository;

import com.example.charging_station_management.entity.converters.ChargingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ChargingSessionRepository extends JpaRepository<ChargingSession, Integer> {

    // 1. Tính tổng doanh thu (Giữ nguyên, SQL chuẩn)
    @Query("SELECT SUM(s.cost) FROM ChargingSession s WHERE s.status = 'COMPLETED'")
    BigDecimal sumTotalRevenue();

    // 2. Thống kê Doanh thu theo tháng (SỬA CHO POSTGRESQL)
    // Thay DATE_FORMAT bằng TO_CHAR
    @Query(value = "SELECT TO_CHAR(start_time, 'YYYY-MM') as time, SUM(cost) as total " +
                   "FROM charging_sessions " +
                   "WHERE status = 'COMPLETED' " +
                   "GROUP BY TO_CHAR(start_time, 'YYYY-MM') " +
                   "ORDER BY time DESC LIMIT 6", nativeQuery = true)
    List<Object[]> getRevenueLast6Months();

    // 3. Thống kê Số lượng phiên sạc theo tháng (SỬA CHO POSTGRESQL)
    // Thay DATE_FORMAT bằng TO_CHAR
    @Query(value = "SELECT TO_CHAR(start_time, 'YYYY-MM') as time, COUNT(*) as count " +
                   "FROM charging_sessions " +
                   "GROUP BY TO_CHAR(start_time, 'YYYY-MM') " +
                   "ORDER BY time DESC LIMIT 6", nativeQuery = true)
    List<Object[]> getSessionsLast6Months();
}
