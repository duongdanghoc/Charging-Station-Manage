package com.example.charging_station_management.service.impl;

import com.example.charging_station_management.dto.mapper.ChargingSessionMapper;
import com.example.charging_station_management.dto.request.ChargingSessionFilterRequest;
import com.example.charging_station_management.dto.response.ChargingSessionDetailResponse;
import com.example.charging_station_management.entity.converters.ChargingSession;
import com.example.charging_station_management.repository.ChargingSessionRepository;
import com.example.charging_station_management.service.ChargingSessionService;
import com.example.charging_station_management.entity.enums.SessionStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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
    // Added dependencies
    private final com.example.charging_station_management.repository.ChargingConnectorRepository connectorRepository;
    private final com.example.charging_station_management.repository.ElectricVehicleRepository vehicleRepository;

    // Constants
    private static final java.math.BigDecimal PRICE_PER_KWH = new java.math.BigDecimal("3000");
    private static final double KWH_PER_MINUTE = 0.5;

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

    // --- Local Implementation ---

    @Override
    @Transactional
    public ChargingSession startSession(Integer userId, Integer connectorId, Integer vehicleId) {
        log.info("User {} requesting start session on connector {} with vehicle {}", userId, connectorId, vehicleId);

        // 1. Check User
        // 1. Check User
        if (userId == null) throw new RuntimeException("User ID is required");
        
        // Check if user already has an active session
        ChargingSession activeSession = getCurrentSession(userId);
        if (activeSession != null) {
            throw new RuntimeException("Bạn đang có một phiên sạc đang diễn ra. Vui lòng kết thúc nó trước khi bắt đầu phiên mới.");
        }

        // 2. Check Connector
        com.example.charging_station_management.entity.converters.ChargingConnector connector = connectorRepository.findById(connectorId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đầu sạc với ID: " + connectorId));

        if (connector.getStatus() != com.example.charging_station_management.entity.enums.ConnectorStatus.AVAILABLE) {
            throw new RuntimeException("Đầu sạc này đang bận hoặc bảo trì.");
        }

        // 3. Check Vehicle
        com.example.charging_station_management.entity.converters.ElectricVehicle vehicle = vehicleRepository.findByIdAndCustomerId(vehicleId, userId)
                .orElseThrow(() -> new RuntimeException("Xe không tồn tại hoặc không thuộc về bạn."));

        // 4. Create Session
        ChargingSession session = new ChargingSession();
        session.setChargingConnector(connector);
        session.setElectricVehicle(vehicle);
        session.setStartTime(java.time.LocalDateTime.now());
        session.setStatus(SessionStatus.CHARGING);
        session.setEnergyKwh(java.math.BigDecimal.ZERO);
        session.setCost(java.math.BigDecimal.ZERO);

        // 5. Update Connector
        connector.setStatus(com.example.charging_station_management.entity.enums.ConnectorStatus.INUSE);
        connectorRepository.save(connector);
        return chargingSessionRepository.save(session);
    }

    @Override
    @Transactional
    public ChargingSession stopSession(Integer userId, Integer sessionId) {
        log.info("User {} requesting stop session {}", userId, sessionId);

        ChargingSession session = chargingSessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Phiên sạc không tồn tại"));

        // 1. Validate Owner
        if (session.getElectricVehicle().getCustomer().getId() != userId) {
            throw new RuntimeException("Bạn không có quyền dừng phiên sạc này.");
        }

        if (session.getStatus() != SessionStatus.CHARGING) {
            throw new RuntimeException("Phiên sạc này đã kết thúc hoặc chưa bắt đầu.");
        }

        // 2. Calculate
        java.time.LocalDateTime now = java.time.LocalDateTime.now();
        session.setEndTime(now);

        java.time.Duration duration = java.time.Duration.between(session.getStartTime(), now);
        long minutes = duration.toMinutes();
        if (minutes < 1) minutes = 1;

        // Dynamic Power Calculation (match getCurrentSession logic)
        java.math.BigDecimal powerKw = java.math.BigDecimal.valueOf(11); // Default 11kW
        if (session.getChargingConnector() != null && session.getChargingConnector().getMaxPower() != null) {
            powerKw = session.getChargingConnector().getMaxPower();
        }
        
        java.math.BigDecimal hours = java.math.BigDecimal.valueOf(minutes).divide(java.math.BigDecimal.valueOf(60), 4, java.math.RoundingMode.HALF_UP);
        java.math.BigDecimal energy = powerKw.multiply(hours).setScale(2, java.math.RoundingMode.HALF_UP);
        java.math.BigDecimal cost = energy.multiply(PRICE_PER_KWH);

        session.setEnergyKwh(energy);
        session.setCost(cost);
        session.setStatus(SessionStatus.COMPLETED);

        // 3. Free Connector
        com.example.charging_station_management.entity.converters.ChargingConnector connector = session.getChargingConnector();
        connector.setStatus(com.example.charging_station_management.entity.enums.ConnectorStatus.AVAILABLE);
        connectorRepository.save(connector);

        return chargingSessionRepository.save(session);
    }

    @Override
    public ChargingSession getCurrentSession(Integer userId) {
        // Updated implementation: Get the latest ACTIVE session to support multiple sessions
        // Returns the most recently started session that is still CHARGING
        java.util.List<ChargingSession> activeSessions = chargingSessionRepository.findByElectricVehicle_Customer_IdAndStatusOrderByStartTimeDesc(userId, SessionStatus.CHARGING);
        
        if (!activeSessions.isEmpty()) {
            ChargingSession currentSession = activeSessions.get(0);
            
            // Logic priority:
            // 1. If DB has values (simulated by external tool or real hardware), use them.
            // 2. If DB is 0 (default), calculate provisional based on time.
            
            boolean hasDbValues = (currentSession.getEnergyKwh() != null && currentSession.getEnergyKwh().compareTo(java.math.BigDecimal.ZERO) > 0)
                               || (currentSession.getCost() != null && currentSession.getCost().compareTo(java.math.BigDecimal.ZERO) > 0);

            if (!hasDbValues) {
                // Calculate provisional values for display
                java.time.LocalDateTime now = java.time.LocalDateTime.now();
                if (currentSession.getStartTime() != null) {
                    java.time.Duration duration = java.time.Duration.between(currentSession.getStartTime(), now);
                    long minutes = duration.toMinutes();
                    
                    if (minutes < 1) minutes = 1;

                    // Dynamic Power Calculation
                    java.math.BigDecimal powerKw = java.math.BigDecimal.valueOf(11); // Default 11kW
                    if (currentSession.getChargingConnector() != null && currentSession.getChargingConnector().getMaxPower() != null) {
                        powerKw = currentSession.getChargingConnector().getMaxPower();
                    }
                    
                    // Energy = Power (kW) * Time (hours)
                    // Time (hours) = minutes / 60
                    java.math.BigDecimal hours = java.math.BigDecimal.valueOf(minutes).divide(java.math.BigDecimal.valueOf(60), 4, java.math.RoundingMode.HALF_UP);
                    java.math.BigDecimal energy = powerKw.multiply(hours).setScale(2, java.math.RoundingMode.HALF_UP);
                    
                    java.math.BigDecimal cost = energy.multiply(PRICE_PER_KWH);
                    
                    currentSession.setEnergyKwh(energy);
                    currentSession.setCost(cost);
                }
            }
            
            return currentSession;
        }
        return null;
    }

    @Override
    public Page<ChargingSession> getSessionHistory(Integer userId, Pageable pageable) {
        return chargingSessionRepository.findByElectricVehicle_Customer_IdOrderByStartTimeDesc(userId, pageable);
    }

    @Override
    public java.util.List<ChargingSession> getActiveSessions(Integer userId) {
        java.util.List<ChargingSession> activeSessions = chargingSessionRepository.findByElectricVehicle_Customer_IdAndStatusOrderByStartTimeDesc(userId, SessionStatus.CHARGING);
        
        for (ChargingSession session : activeSessions) {
            boolean hasDbValues = (session.getEnergyKwh() != null && session.getEnergyKwh().compareTo(java.math.BigDecimal.ZERO) > 0)
                               || (session.getCost() != null && session.getCost().compareTo(java.math.BigDecimal.ZERO) > 0);

            if (!hasDbValues && session.getStartTime() != null) {
                java.time.LocalDateTime now = java.time.LocalDateTime.now();
                java.time.Duration duration = java.time.Duration.between(session.getStartTime(), now);
                long minutes = duration.toMinutes();
                
                if (minutes < 1) minutes = 1;

                // Dynamic Power Calculation
                java.math.BigDecimal powerKw = java.math.BigDecimal.valueOf(11); // Default 11kW
                if (session.getChargingConnector() != null && session.getChargingConnector().getMaxPower() != null) {
                    powerKw = session.getChargingConnector().getMaxPower();
                }
                
                java.math.BigDecimal hours = java.math.BigDecimal.valueOf(minutes).divide(java.math.BigDecimal.valueOf(60), 4, java.math.RoundingMode.HALF_UP);
                java.math.BigDecimal energy = powerKw.multiply(hours).setScale(2, java.math.RoundingMode.HALF_UP);
                java.math.BigDecimal cost = energy.multiply(PRICE_PER_KWH);
                
                session.setEnergyKwh(energy);
                session.setCost(cost);
            }
        }
        return activeSessions;
    }
}
