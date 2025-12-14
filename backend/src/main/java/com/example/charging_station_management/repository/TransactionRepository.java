package com.example.charging_station_management.repository;

import com.example.charging_station_management.entity.converters.Transaction;
import com.example.charging_station_management.entity.enums.PaymentMethod;
import com.example.charging_station_management.entity.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository
        extends JpaRepository<Transaction, Integer>,
        JpaSpecificationExecutor<Transaction> {

        @EntityGraph(attributePaths = {
                "chargingSession",
                "chargingSession.chargingConnector.pole.station"
        })
        Page<Transaction> findByCustomer_IdOrderByPaymentTimeDesc(Integer customerId, Pageable pageable);

        List<Transaction> findByCustomerId(Integer customerId);
        List<Transaction> findByPaymentStatus(PaymentStatus paymentStatus);
        List<Transaction> findByPaymentMethod(PaymentMethod paymentMethod);
        List<Transaction> findByPaymentTimeBetween(LocalDateTime start, LocalDateTime end);
}
