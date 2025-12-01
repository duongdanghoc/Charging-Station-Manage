package com.example.charging_station_management.repository;

import com.example.charging_station_management.entity.converters.ChargingPole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChargingPoleRepository extends JpaRepository<ChargingPole, Integer> {

    List<ChargingPole> findByStationId(Integer stationId);

    @Query("SELECT p FROM ChargingPole p WHERE p.station.vendor.id = :vendorId")
    List<ChargingPole> findByVendorId(@Param("vendorId") Integer vendorId);

    @Query("SELECT p FROM ChargingPole p WHERE p.id = :poleId AND p.station.vendor.id = :vendorId")
    Optional<ChargingPole> findByIdAndVendorId(@Param("poleId") Integer poleId, @Param("vendorId") Integer vendorId);
}