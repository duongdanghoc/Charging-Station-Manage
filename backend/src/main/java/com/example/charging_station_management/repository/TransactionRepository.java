package com.example.charging_station_management.repository;

import com.example.charging_station_management.entity.converters.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import com.example.charging_station_management.entity.enums.PaymentMethod;
import com.example.charging_station_management.entity.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Integer> {

    // Query tính tổng doanh thu của một trạm cụ thể (chỉ tính các giao dịch đã PAID)
    // Join: Transaction -> ChargingSession -> ChargingConnector -> ChargingPole -> Station
    @Query("SELECT SUM(t.amount) FROM Transaction t " +
           "WHERE t.paymentStatus = 'PAID' " +
           "AND t.chargingSession.chargingConnector.pole.station.id = :stationId")
    BigDecimal sumAmountByStationId(Integer stationId);
    @EntityGraph(attributePaths = {
            "chargingSession",
            "chargingSession.chargingConnector.pole.station"
    })
    Page<Transaction> findByCustomer_IdOrderByPaymentTimeDesc(Integer customerId, Pageable pageable);

    // Advanced search query for admin
    @Query("SELECT DISTINCT t FROM Transaction t " +
            "JOIN FETCH t.customer c " +
            "JOIN FETCH t.chargingSession cs " +
            "JOIN FETCH cs.electricVehicle ev " +
            "JOIN FETCH cs.chargingConnector cc " +
            "JOIN FETCH cc.pole p " +
            "JOIN FETCH p.station s " +
            "JOIN FETCH s.location l " +
            "JOIN FETCH s.vendor v " +
            "WHERE (:customerId IS NULL OR c.id = :customerId) " +
            "AND (:stationId IS NULL OR s.id = :stationId) " +
            "AND (:paymentStatus IS NULL OR t.paymentStatus = :paymentStatus) " +
            "AND (:paymentMethod IS NULL OR t.paymentMethod = :paymentMethod) " +
            "AND (:paymentTimeFrom IS NULL OR t.paymentTime >= :paymentTimeFrom) " +
            "AND (:paymentTimeTo IS NULL OR t.paymentTime <= :paymentTimeTo) " +
            "AND (:createdAtFrom IS NULL OR t.createdAt >= :createdAtFrom) " +
            "AND (:createdAtTo IS NULL OR t.createdAt <= :createdAtTo) " +
            "AND (:amountFrom IS NULL OR t.amount >= :amountFrom) " +
            "AND (:amountTo IS NULL OR t.amount <= :amountTo) " +
            "AND (:customerName IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :customerName, '%'))) " +
            "AND (:stationName IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :stationName, '%'))) " +
            "AND (:bankName IS NULL OR LOWER(t.bankName) LIKE LOWER(CONCAT('%', :bankName, '%')))")
    Page<Transaction> searchTransactions(
            @Param("customerId") Integer customerId,
            @Param("stationId") Integer stationId,
            @Param("paymentStatus") PaymentStatus paymentStatus,
            @Param("paymentMethod") PaymentMethod paymentMethod,
            @Param("paymentTimeFrom") LocalDateTime paymentTimeFrom,
            @Param("paymentTimeTo") LocalDateTime paymentTimeTo,
            @Param("createdAtFrom") LocalDateTime createdAtFrom,
            @Param("createdAtTo") LocalDateTime createdAtTo,
            @Param("amountFrom") BigDecimal amountFrom,
            @Param("amountTo") BigDecimal amountTo,
            @Param("customerName") String customerName,
            @Param("stationName") String stationName,
            @Param("bankName") String bankName,
            Pageable pageable
    );
}
