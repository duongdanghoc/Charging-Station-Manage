package com.example.charging_station_management.repository;

import com.example.charging_station_management.entity.converters.ChargingSession;
import com.example.charging_station_management.entity.enums.SessionStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ChargingSessionRepository extends JpaRepository<ChargingSession, Integer>, JpaSpecificationExecutor<ChargingSession> {

    // Đếm số phiên sạc dựa trên Station ID và danh sách trạng thái
    @Query("SELECT COUNT(s) FROM ChargingSession s " +
            "JOIN s.chargingConnector c " +
            "JOIN c.pole p " +
            "JOIN p.station st " +
            "WHERE st.id = :stationId AND s.status IN :statuses")
    long countByStationIdAndStatusIn(@Param("stationId") Integer stationId,
            @Param("statuses") List<SessionStatus> statuses);

    @EntityGraph(attributePaths = {
            "electricVehicle",
            "chargingConnector.pole.station.location",
            "transaction"
    })
    Page<ChargingSession> findByElectricVehicle_Customer_IdOrderByStartTimeDesc(Integer customerId, Pageable pageable);

    @Query("SELECT cs FROM ChargingSession cs " +
            "JOIN FETCH cs.electricVehicle ev " +
            "JOIN FETCH ev.customer c " +
            "JOIN FETCH cs.chargingConnector cc " +
            "JOIN FETCH cc.pole p " +
            "JOIN FETCH p.station s " +
            "JOIN FETCH s.location l " +
            "JOIN FETCH s.vendor v " +
            "LEFT JOIN FETCH cs.transaction t " +
            "WHERE c.id = :customerId " +
            "AND (:status IS NULL OR cs.status = :status) " +
            "AND (:startTimeFrom IS NULL OR cs.startTime >= :startTimeFrom) " +
            "AND (:startTimeTo IS NULL OR cs.startTime <= :startTimeTo)")
    Page<ChargingSession> findByCustomerWithFilters(
            @Param("customerId") Integer customerId,
            @Param("status") SessionStatus status,
            @Param("startTimeFrom") LocalDateTime startTimeFrom,
            @Param("startTimeTo") LocalDateTime startTimeTo,
            Pageable pageable
    );

    @Query("SELECT cs FROM ChargingSession cs " +
            "JOIN FETCH cs.electricVehicle ev " +
            "JOIN FETCH ev.customer c " +
            "JOIN FETCH cs.chargingConnector cc " +
            "JOIN FETCH cc.pole p " +
            "JOIN FETCH p.station s " +
            "JOIN FETCH s.location l " +
            "JOIN FETCH s.vendor v " +
            "LEFT JOIN FETCH cs.transaction t " +
            "WHERE s.id = :stationId " +
            "AND (:status IS NULL OR cs.status = :status) " +
            "AND (:startTimeFrom IS NULL OR cs.startTime >= :startTimeFrom) " +
            "AND (:startTimeTo IS NULL OR cs.startTime <= :startTimeTo)")
    Page<ChargingSession> findByStationWithFilters(
            @Param("stationId") Integer stationId,
            @Param("status") SessionStatus status,
            @Param("startTimeFrom") LocalDateTime startTimeFrom,
            @Param("startTimeTo") LocalDateTime startTimeTo,
            Pageable pageable
    );

    @Query("SELECT DISTINCT cs FROM ChargingSession cs " +
            "JOIN FETCH cs.electricVehicle ev " +
            "JOIN FETCH ev.customer c " +
            "JOIN FETCH cs.chargingConnector cc " +
            "JOIN FETCH cc.pole p " +
            "JOIN FETCH p.station s " +
            "JOIN FETCH s.location l " +
            "JOIN FETCH s.vendor v " +
            "LEFT JOIN FETCH cs.transaction t " +
            "WHERE (:customerId IS NULL OR c.id = :customerId) " +
            "AND (:stationId IS NULL OR s.id = :stationId) " +
            "AND (:status IS NULL OR cs.status = :status) " +
            "AND (:startTimeFrom IS NULL OR cs.startTime >= :startTimeFrom) " +
            "AND (:startTimeTo IS NULL OR cs.startTime <= :startTimeTo) " +
            "AND (:endTimeFrom IS NULL OR cs.endTime >= :endTimeFrom) " +
            "AND (:endTimeTo IS NULL OR cs.endTime <= :endTimeTo) " +
            "AND (:customerName IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :customerName, '%'))) " +
            "AND (:stationName IS NULL OR LOWER(s.name) LIKE LOWER(CONCAT('%', :stationName, '%'))) " +
            "AND (:licensePlate IS NULL OR LOWER(ev.licensePlate) LIKE LOWER(CONCAT('%', :licensePlate, '%')))")
    Page<ChargingSession> searchChargingSessions(
            @Param("customerId") Integer customerId,
            @Param("stationId") Integer stationId,
            @Param("status") SessionStatus status,
            @Param("startTimeFrom") LocalDateTime startTimeFrom,
            @Param("startTimeTo") LocalDateTime startTimeTo,
            @Param("endTimeFrom") LocalDateTime endTimeFrom,
            @Param("endTimeTo") LocalDateTime endTimeTo,
            @Param("customerName") String customerName,
            @Param("stationName") String stationName,
            @Param("licensePlate") String licensePlate,
            Pageable pageable
    );

}
