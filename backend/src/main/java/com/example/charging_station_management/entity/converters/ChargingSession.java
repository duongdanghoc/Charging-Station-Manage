package com.example.charging_station_management.entity.converters;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "charging_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChargingSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "electric_vehicle_id", nullable = false)
    private ElectricVehicle electricVehicle;

    @ManyToOne
    @JoinColumn(name = "charging_connector_id", nullable = false)
    private ChargingConnector chargingConnector;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    @Column(precision = 10, scale = 2)
    private BigDecimal energyKwh;

    @Column(precision = 15, scale = 2)
    private BigDecimal cost;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "session_status")
    private SessionStatus status = SessionStatus.pending;

    @OneToOne(mappedBy = "chargingSession", cascade = CascadeType.ALL)
    private Transaction transaction;

    public enum SessionStatus {
        pending, charging, completed, cancelled, failed
    }
}