package com.example.charging_station_management.service;

import com.example.charging_station_management.dto.request.ChargingSessionFilterRequest;
import com.example.charging_station_management.dto.response.ChargingSessionDetailResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ChargingSessionService {
    /**
     * Get all charging sessions with filters and pagination
     *
     * @param filterRequest Filter criteria
     * @param pageable Pagination and sorting parameters
     * @return Page of charging session details
     */
    Page<ChargingSessionDetailResponse> getAllChargingSessions(
            ChargingSessionFilterRequest filterRequest,
            Pageable pageable
    );

    /**
     * Get charging session by ID
     *
     * @param sessionId Session ID
     * @return Charging session detail
     */
    ChargingSessionDetailResponse getChargingSessionById(Integer sessionId);
}
