package com.example.charging_station_management.repository;

import com.example.charging_station_management.dto.response.ChargingHistoryResponse;
import com.example.charging_station_management.entity.converters.ChargingSession;
import com.example.charging_station_management.entity.enums.SessionStatus;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChargingSessionRepository extends JpaRepository<ChargingSession, Integer> {

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
}
