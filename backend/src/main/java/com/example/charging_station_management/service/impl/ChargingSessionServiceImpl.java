package com.example.charging_station_management.service.impl;

import com.example.charging_station_management.dto.mapper.ChargingSessionMapper;
import com.example.charging_station_management.dto.request.ChargingSessionFilterRequest;
import com.example.charging_station_management.dto.response.ChargingSessionDetailResponse;
import com.example.charging_station_management.entity.converters.ChargingSession;
import com.example.charging_station_management.repository.ChargingSessionRepository;
import com.example.charging_station_management.service.ChargingSessionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ChargingSessionServiceImpl implements ChargingSessionService {
    private final ChargingSessionRepository chargingSessionRepository;
    private final ChargingSessionMapper chargingSessionMapper;

    @Override
    public Page<ChargingSessionDetailResponse> getAllChargingSessions(
            ChargingSessionFilterRequest filterRequest,
            Pageable pageable) {

        log.info("Fetching charging sessions with filters: {}", filterRequest);

        Page<ChargingSession> sessions = chargingSessionRepository.searchChargingSessions(
                filterRequest.getCustomerId(),
                filterRequest.getStationId(),
                filterRequest.getStatus(),
                filterRequest.getStartTimeFrom(),
                filterRequest.getStartTimeTo(),
                filterRequest.getEndTimeFrom(),
                filterRequest.getEndTimeTo(),
                filterRequest.getCustomerName(),
                filterRequest.getStationName(),
                filterRequest.getLicensePlate(),
                pageable
        );

        log.info("Found {} charging sessions", sessions.getTotalElements());

        return sessions.map(chargingSessionMapper::toDetailResponse);
    }

    @Override
    public ChargingSessionDetailResponse getChargingSessionById(Integer sessionId) {
        log.info("Fetching charging session with id: {}", sessionId);

        ChargingSession session = chargingSessionRepository.findById(sessionId)
                .orElseThrow(() -> {
                    log.error("Charging session not found with id: {}", sessionId);
                    return new RuntimeException("Charging session not found: " + sessionId);
                });

        return chargingSessionMapper.toDetailResponse(session);
    }
}
