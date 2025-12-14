package com.example.charging_station_management.repository;

import com.example.charging_station_management.entity.converters.ChargingPole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChargingPoleRepository extends JpaRepository<ChargingPole, Integer> {

    // 👇 SỬA LẠI DÒNG NÀY: Dùng @Query để map chính xác station.id
    @Query("SELECT p FROM ChargingPole p WHERE p.station.id = :stationId")
    List<ChargingPole> findByStationId(@Param("stationId") Integer stationId);

    // Các hàm dưới giữ nguyên
    @Query("SELECT p FROM ChargingPole p WHERE p.station.vendor.id = :vendorId")
    List<ChargingPole> findByVendorId(@Param("vendorId") Integer vendorId);

    @Query("SELECT p FROM ChargingPole p WHERE p.id = :poleId AND p.station.vendor.id = :vendorId")
    Optional<ChargingPole> findByIdAndVendorId(@Param("poleId") Integer poleId, @Param("vendorId") Integer vendorId);
    
    @Modifying
    @Query("UPDATE ChargingPole p SET p.connectorCount = p.connectorCount - 1 WHERE p.id = :poleId AND p.connectorCount > 0")
    void decrementConnectorCount(@Param("poleId") Integer poleId);
}