package com.example.charging_station_management.repository;

import com.example.charging_station_management.entity.converters.Transaction;
import com.example.charging_station_management.entity.enums.PaymentMethod;
import com.example.charging_station_management.entity.enums.PaymentStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository
        extends JpaRepository<Transaction, Integer>,
        JpaSpecificationExecutor<Transaction> {

    List<Transaction> findByCustomerId(Integer customerId);

    List<Transaction> findByPaymentStatus(PaymentStatus paymentStatus);

    List<Transaction> findByPaymentMethod(PaymentMethod paymentMethod);

    List<Transaction> findByPaymentTimeBetween(LocalDateTime start, LocalDateTime end);

    @EntityGraph(attributePaths = {
            "chargingSession",
            "chargingSession.chargingConnector.pole.station"
    })
    Page<Transaction> findByCustomer_IdOrderByPaymentTimeDesc(Integer customerId, Pageable pageable);

    @Query("""
                SELECT t FROM Transaction t
                JOIN t.chargingSession s
                JOIN s.chargingConnector c
                JOIN c.pole p
                JOIN p.station st
                WHERE st.vendor.id = :vendorId
                AND t.paymentStatus = :status
                AND t.paymentTime >= :startTime
                AND t.paymentTime <= :endTime
                ORDER BY t.paymentTime ASC
            """)
    List<Transaction> findTransactionsByVendorAndDateRange(
            @Param("vendorId") Integer vendorId,
            @Param("status") PaymentStatus status,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime);
}
