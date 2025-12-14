package com.example.charging_station_management.repository;

import com.example.charging_station_management.entity.converters.Price;
import com.example.charging_station_management.entity.enums.PriceName;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface PriceRepository extends JpaRepository<Price, Integer> {

    // 1. FIX LỖI #1: Đổi tên phương thức tự động findByChargingPoleId -> findByPoleId
    // Vì thuộc tính trong Entity Price là 'pole'
    List<Price> findByPoleId(Integer poleId);

    // 2. FIX LỖI #2: Sửa truy vấn HQL (p.chargingPole.id -> p.pole.id)
    @Query("SELECT p FROM Price p WHERE p.pole.id = :poleId " +
           "AND p.name = :name " +
           "AND (CAST(:excludeId AS integer) IS NULL OR p.id != :excludeId) " +
           "AND (p.effectiveTo IS NULL OR p.effectiveTo >= :effectiveFrom) " +
           "AND (CAST(:effectiveTo AS date) IS NULL OR p.effectiveFrom <= :effectiveTo) " +
           "AND (p.startTime < :endTime AND p.endTime > :startTime)")
    List<Price> findOverlappingPrices(@Param("poleId") Integer poleId,
                                      @Param("name") PriceName name,
                                      @Param("excludeId") Integer excludeId,
                                      @Param("effectiveFrom") LocalDate effectiveFrom,
                                      @Param("effectiveTo") LocalDate effectiveTo,
                                      @Param("startTime") LocalTime startTime,
                                      @Param("endTime") LocalTime endTime);
}