package com.example.charging_station_management.repository;

import com.example.charging_station_management.entity.converters.Station;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StationRepository extends JpaRepository<Station, Integer> {

    List<Station> findByVendorId(Integer vendorId);

    @Query("SELECT s FROM Station s WHERE s.id = :stationId AND s.vendor.id = :vendorId")
    Optional<Station> findByIdAndVendorId(@Param("stationId") Integer stationId, @Param("vendorId") Integer vendorId);

    @Query("SELECT s FROM Station s WHERE " +
            "LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(s.location.addressDetail) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(s.location.province) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Station> searchStations(@Param("query") String query, Pageable pageable);

    Page<Station> findByVendorId(Integer vendorId, Pageable pageable);
}
