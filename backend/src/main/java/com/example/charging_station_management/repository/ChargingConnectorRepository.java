package com.example.charging_station_management.repository;

import com.example.charging_station_management.entity.converters.ChargingConnector;
import com.example.charging_station_management.entity.enums.ConnectorStatus;
import com.example.charging_station_management.entity.enums.ConnectorType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying; // 👈 Quan trọng: Import cái này
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChargingConnectorRepository extends JpaRepository<ChargingConnector, Integer> {

    List<ChargingConnector> findByPoleId(Integer poleId);

    List<ChargingConnector> findByStatus(ConnectorStatus status);

    List<ChargingConnector> findByConnectorType(ConnectorType connectorType);

    List<ChargingConnector> findByPoleIdAndStatus(Integer poleId, ConnectorStatus status);

    // Tìm tất cả connector của vendor (qua pole -> station -> vendor)
    @Query("SELECT c FROM ChargingConnector c WHERE c.pole.station.vendor.id = :vendorId")
    List<ChargingConnector> findByVendorId(@Param("vendorId") Integer vendorId);

    // Tìm connector theo ID và kiểm tra thuộc vendor
    @Query("SELECT c FROM ChargingConnector c WHERE c.id = :connectorId AND c.pole.station.vendor.id = :vendorId")
    Optional<ChargingConnector> findByIdAndVendorId(@Param("connectorId") Integer connectorId, @Param("vendorId") Integer vendorId);

    // Tìm connector của vendor theo station
    @Query("SELECT c FROM ChargingConnector c " +
            "WHERE c.pole.station.vendor.id = :vendorId " +
            "AND c.pole.station.id = :stationId")
    List<ChargingConnector> findByVendorIdAndStationId(
            @Param("vendorId") Integer vendorId,
            @Param("stationId") Integer stationId);

    // Tìm connector available của một station
    @Query("SELECT c FROM ChargingConnector c " +
            "WHERE c.pole.station.id = :stationId " +
            "AND c.status = 'AVAILABLE'") // 👈 Đã sửa lỗi chính tả: AVAILABALE -> AVAILABLE
    List<ChargingConnector> findAvailableByStationId(@Param("stationId") Integer stationId);

    // Tìm connector theo nhiều tiêu chí
    @Query("SELECT c FROM ChargingConnector c WHERE " +
            "c.pole.station.vendor.id = :vendorId AND " +
            "(:connectorType IS NULL OR c.connectorType = :connectorType) AND " +
            "(:status IS NULL OR c.status = :status) AND " +
            "(:poleId IS NULL OR c.pole.id = :poleId)")
    List<ChargingConnector> searchConnectors(
            @Param("vendorId") Integer vendorId,
            @Param("connectorType") ConnectorType connectorType,
            @Param("status") ConnectorStatus status,
            @Param("poleId") Integer poleId);

    // Kiểm tra connector có đang được sử dụng không
    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END " +
            "FROM ChargingSession s " +
            "WHERE s.chargingConnector.id = :connectorId " +
            "AND s.status IN ('PENDING', 'CHARGING')")
    boolean isConnectorInUse(@Param("connectorId") Integer connectorId);

    // Đếm số connector theo trạng thái của vendor
    @Query("SELECT c.status, COUNT(c) FROM ChargingConnector c " +
            "WHERE c.pole.station.vendor.id = :vendorId " +
            "GROUP BY c.status")
    List<Object[]> countConnectorsByStatus(@Param("vendorId") Integer vendorId);

    // 👇👇👇 HÀM MỚI: XÓA CỨNG TRỰC TIẾP BẰNG SQL 👇👇👇
    @Modifying
    @Query("DELETE FROM ChargingConnector c WHERE c.id = :id")
    void deleteHard(@Param("id") Integer id);
}