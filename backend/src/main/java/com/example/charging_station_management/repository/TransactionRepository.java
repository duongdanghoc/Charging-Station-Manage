package com.example.charging_station_management.repository;

import com.example.charging_station_management.entity.converters.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Integer> {

    // Query tính tổng doanh thu của một trạm cụ thể (chỉ tính các giao dịch đã PAID)
    // Join: Transaction -> ChargingSession -> ChargingConnector -> ChargingPole -> Station
    @Query("SELECT SUM(t.amount) FROM Transaction t " +
           "WHERE t.paymentStatus = 'PAID' " +
           "AND t.chargingSession.chargingConnector.pole.station.id = :stationId")
    BigDecimal sumAmountByStationId(Integer stationId);
}
