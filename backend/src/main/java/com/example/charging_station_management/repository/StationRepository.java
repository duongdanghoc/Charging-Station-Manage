package com.example.charging_station_management.repository;

import com.example.charging_station_management.entity.converters.Station;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface StationRepository extends JpaRepository<Station, Integer> {
    
    @Query("SELECT s FROM Station s WHERE " +
           "LOWER(s.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.location.addressDetail) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(s.location.province) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Station> searchStations(@Param("query") String query, Pageable pageable);
}
