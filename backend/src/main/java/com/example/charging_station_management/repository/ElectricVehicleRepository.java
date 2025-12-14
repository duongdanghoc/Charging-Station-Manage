package com.example.charging_station_management.repository;

import com.example.charging_station_management.entity.converters.ElectricVehicle;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ElectricVehicleRepository extends JpaRepository<ElectricVehicle, Integer> {

    // 👇 KHAI BÁO HÀM NÀY ĐỂ SỬA LỖI
    // Spring Data JPA sẽ tự động hiểu là:
    // "Tìm tất cả xe có customer.id = customerId và phân trang"
    Page<ElectricVehicle> findByCustomerId(Integer customerId, Pageable pageable);
    
    List<ElectricVehicle> findByCustomerId(Integer customerId);
    
    Optional<ElectricVehicle> findByLicensePlate(String licensePlate);
    
    @Query("SELECT CASE WHEN COUNT(v) > 0 THEN true ELSE false END " +
           "FROM ElectricVehicle v WHERE v.licensePlate = :licensePlate " +
           "AND (:vehicleId IS NULL OR v.id != :vehicleId)")
    boolean existsByLicensePlateAndIdNot(@Param("licensePlate") String licensePlate,
                                         @Param("vehicleId") Integer vehicleId);

    @Query(value = "SELECT CASE WHEN COUNT(*) > 0 THEN true ELSE false END " +
           "FROM electric_vehicles " +
           "WHERE REGEXP_REPLACE(license_plate, '[^a-zA-Z0-9]', '', 'g') = :normalizedPlate " +
           "AND (:vehicleId IS NULL OR id != :vehicleId)", nativeQuery = true)
    boolean existsByNormalizedLicensePlateAndIdNot(@Param("normalizedPlate") String normalizedPlate, 
                                                   @Param("vehicleId") Integer vehicleId);
    
    @Query("SELECT CASE WHEN COUNT(cs) > 0 THEN true ELSE false END " +
           "FROM ChargingSession cs " +
           "WHERE cs.electricVehicle.id = :vehicleId " +
           "AND cs.status IN ('PENDING', 'CHARGING')")
    boolean hasActiveChargingSession(@Param("vehicleId") Integer vehicleId);
}
