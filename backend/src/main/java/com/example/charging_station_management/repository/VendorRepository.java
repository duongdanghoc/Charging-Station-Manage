package com.example.charging_station_management.repository;

import com.example.charging_station_management.entity.converters.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, Integer> {

    boolean existsByEmail(String email);

    Optional<Vendor> findByEmail(String email);
}
