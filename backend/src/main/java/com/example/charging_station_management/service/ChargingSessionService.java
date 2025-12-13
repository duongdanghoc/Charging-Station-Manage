package com.example.charging_station_management.service;

import com.example.charging_station_management.dto.request.ChargingSessionFilterRequest;
import com.example.charging_station_management.dto.response.ChargingSessionDetailResponse;
import com.example.charging_station_management.entity.converters.ChargingSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ChargingSessionService {

    Page<ChargingSessionDetailResponse> getAllChargingSessions(ChargingSessionFilterRequest filterRequest,
            Pageable pageable);

    ChargingSessionDetailResponse getChargingSessionById(Integer sessionId);

    ChargingSession startSession(Integer userId, Integer connectorId, Integer vehicleId);

    ChargingSession stopSession(Integer userId, Integer sessionId);

    ChargingSession getCurrentSession(Integer userId);

    Page<ChargingSession> getSessionHistory(Integer userId, Pageable pageable);
}
