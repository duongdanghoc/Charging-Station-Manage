package com.example.charging_station_management.repository;

import com.example.charging_station_management.entity.converters.ChargingPole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChargingPoleRepository extends JpaRepository<ChargingPole, Integer> {
    
    List<ChargingPole> findByStationId(Integer stationId);

    Optional<ChargingPole> findByIdAndStation_Vendor_Id(Integer id, Integer vendorId);

    // Tìm kiếm trụ sạc thuộc vendor (thông qua Station)
    default Optional<ChargingPole> findByIdAndVendorId(Integer id, Integer vendorId) {
        return findByIdAndStation_Vendor_Id(id, vendorId);
    }

    // ❌ ĐÃ XÓA: incrementConnectorCount và decrementConnectorCount
    // Vì trường connectorCount đã bị loại bỏ khỏi Entity.
    // Việc đếm số lượng connector giờ đây được thực hiện tự động bằng cách đếm list connectors.
}