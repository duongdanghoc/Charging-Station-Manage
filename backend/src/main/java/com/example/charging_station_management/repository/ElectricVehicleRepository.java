package com.example.charging_station_management.repository;

import com.example.charging_station_management.entity.converters.ElectricVehicle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ElectricVehicleRepository extends JpaRepository<ElectricVehicle, Integer> {

    // 👇 KHAI BÁO HÀM NÀY ĐỂ SỬA LỖI
    // Spring Data JPA sẽ tự động hiểu là:
    // "Tìm tất cả xe có customer.id = customerId và phân trang"
    Page<ElectricVehicle> findByCustomerId(Integer customerId, Pageable pageable);
}
