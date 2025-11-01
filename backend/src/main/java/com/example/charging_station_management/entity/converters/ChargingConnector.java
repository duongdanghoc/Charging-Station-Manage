package com.example.charging_station_management.entity.converters;

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
    @Column(nullable = false, columnDefinition = "connector_type")
    private ConnectorType connectorType;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal maxPower;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "connector_status")
    private ConnectorStatus status = ConnectorStatus.available;

    @OneToMany(mappedBy = "chargingConnector", cascade = CascadeType.ALL)
    private List<ChargingSession> chargingSessions;

    public enum ConnectorType {
        Type1, Type2, CHAdeMO, CCS, Tesla
    }

    public enum ConnectorStatus {
        available, in_use, out_of_service
    }
}