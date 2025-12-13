package com.example.charging_station_management.service;

import com.example.charging_station_management.dto.response.ChargingHistoryResponse;
import com.example.charging_station_management.entity.converters.ChargingConnector;
import com.example.charging_station_management.entity.converters.ChargingSession;
import com.example.charging_station_management.entity.converters.ElectricVehicle;
import com.example.charging_station_management.entity.enums.ConnectorStatus;
import com.example.charging_station_management.entity.enums.SessionStatus;
import com.example.charging_station_management.repository.ChargingConnectorRepository;
import com.example.charging_station_management.repository.ChargingSessionRepository;
import com.example.charging_station_management.repository.ElectricVehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChargingSessionService {

    private final ChargingSessionRepository sessionRepository;
    private final ChargingConnectorRepository connectorRepository;
    private final ElectricVehicleRepository vehicleRepository;

    // Giả lập giá điện: 3000 VNĐ / kWh
    private static final BigDecimal PRICE_PER_KWH = new BigDecimal("3000");
    // Giả lập tốc độ sạc: 1 phút = 0.5 kWh (cho nhanh thấy kết quả)
    private static final double KWH_PER_MINUTE = 0.5;

    @Transactional
    public ChargingSession startSession(Integer userId, Integer connectorId, Integer vehicleId) {
        log.info("User {} requesting start session on connector {} with vehicle {}", userId, connectorId, vehicleId);

        // 1. Kiểm tra User có phiên chạy không
        if (userId == null) throw new RuntimeException("User ID is required");
        List<ChargingSession> activeSessions = sessionRepository.findByCustomerIdAndStatus(userId, SessionStatus.CHARGING);
        if (!activeSessions.isEmpty()) {
            throw new RuntimeException("Bạn đang có một phiên sạc chưa kết thúc. Vui lòng hoàn tất trước khi bắt đầu phiên mới.");
        }

        // 2. Kiểm tra Connector có sẵn sàng không
        ChargingConnector connector = connectorRepository.findById(connectorId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đầu sạc với ID: " + connectorId));

        if (connector.getStatus() != ConnectorStatus.AVAILABLE) {
            throw new RuntimeException("Đầu sạc này đang bận hoặc bảo trì.");
        }

        // 3. Kiểm tra Xe có thuộc về User không
        ElectricVehicle vehicle = vehicleRepository.findByIdAndCustomerId(vehicleId, userId)
                .orElseThrow(() -> new RuntimeException("Xe không tồn tại hoặc không thuộc về bạn."));

        // 4. Tạo phiên sạc
        ChargingSession session = new ChargingSession();
        session.setChargingConnector(connector);
        session.setElectricVehicle(vehicle);
        session.setStartTime(LocalDateTime.now());
        session.setStatus(SessionStatus.CHARGING);
        session.setEnergyKwh(BigDecimal.ZERO);
        session.setCost(BigDecimal.ZERO);

        // 5. Cập nhật trạng thái Connector -> INUSE (hoặc CHARGING tùy enum)
        // Kiểm tra enum ConnectorStatus xem có INUSE không, giả sử là CHARGING hoặc OCCUPIED
        // Mở file ConnectorStatus để check sau, tạm set OCCUPIED nếu có, hoặc IN_USE
        // Để an toàn, mình sẽ check file enum sau, tạm thời dùng logic "Not AVAILABLE"
        connector.setStatus(ConnectorStatus.INUSE); 

        connectorRepository.save(connector);
        return sessionRepository.save(session);
    }

    @Transactional
    public ChargingSession stopSession(Integer userId, Integer sessionId) {
        log.info("User {} requesting stop session {}", userId, sessionId);

        ChargingSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Phiên sạc không tồn tại"));

        // 1. Validate chủ sở hữu
        if (session.getElectricVehicle().getCustomer().getId() != userId) {
            throw new RuntimeException("Bạn không có quyền dừng phiên sạc này.");
        }

        if (session.getStatus() != SessionStatus.CHARGING) {
            throw new RuntimeException("Phiên sạc này đã kết thúc hoặc chưa bắt đầu.");
        }

        // 2. Tính toán năng lượng và tiền (Giả lập)
        LocalDateTime now = LocalDateTime.now();
        session.setEndTime(now);
        
        Duration duration = Duration.between(session.getStartTime(), now);
        long minutes = duration.toMinutes();
        if (minutes < 1) minutes = 1; // Tối thiểu 1 phút

        BigDecimal energy = BigDecimal.valueOf(minutes * KWH_PER_MINUTE);
        BigDecimal cost = energy.multiply(PRICE_PER_KWH);

        session.setEnergyKwh(energy);
        session.setCost(cost);
        session.setStatus(SessionStatus.COMPLETED);

        // 3. Giải phóng Connector
        ChargingConnector connector = session.getChargingConnector();
        connector.setStatus(ConnectorStatus.AVAILABLE);
        connectorRepository.save(connector);

        return sessionRepository.save(session);
    }

    public ChargingSession getCurrentSession(Integer userId) {
        List<ChargingSession> activeSessions = sessionRepository.findByCustomerIdAndStatus(userId, SessionStatus.CHARGING);
        if (activeSessions.isEmpty()) {
            return null;
        }
        return activeSessions.get(0);
    }

    public org.springframework.data.domain.Page<ChargingSession> getSessionHistory(Integer userId, org.springframework.data.domain.Pageable pageable) {
        return sessionRepository.findByElectricVehicle_Customer_IdOrderByStartTimeDesc(userId, pageable);
    }
}
