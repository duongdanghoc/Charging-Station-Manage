package com.example.charging_station_management.repository;

import com.example.charging_station_management.entity.converters.RescueStation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.stereotype.Repository;

@Repository
public interface RescueStationRepository extends JpaRepository<RescueStation, Integer> {
    // Có thể thêm tìm kiếm theo tên hoặc số điện thoại nếu cần
    boolean existsByName(String name);
    @Query("SELECT r FROM RescueStation r WHERE :keyword IS NULL OR :keyword = '' OR LOWER(r.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR r.phone LIKE CONCAT('%', :keyword, '%')")
    Page<RescueStation> search(String keyword, Pageable pageable);
}
