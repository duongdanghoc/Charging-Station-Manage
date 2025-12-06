package com.example.charging_station_management.repository;

import com.example.charging_station_management.entity.converters.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Integer> {

    @EntityGraph(attributePaths = {
            "chargingSession",
            "chargingSession.chargingConnector.pole.station"
    })
    Page<Transaction> findByCustomer_IdOrderByPaymentTimeDesc(Integer customerId, Pageable pageable);
}
