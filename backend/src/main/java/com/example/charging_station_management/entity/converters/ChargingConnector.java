package com.example.charging_station_management.entity.converters;

import com.example.charging_station_management.entity.enums.ConnectorStatus;
import com.example.charging_station_management.entity.enums.ConnectorType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "charging_connectors")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChargingConnector {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "pole_id", nullable = false)
    private ChargingPole pole;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 100)
    private ConnectorType connectorType;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal maxPower;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 100)
    private ConnectorStatus status = ConnectorStatus.AVAILABALE;

    @OneToMany(mappedBy = "chargingConnector", cascade = CascadeType.ALL)
    private List<ChargingSession> chargingSessions;
}