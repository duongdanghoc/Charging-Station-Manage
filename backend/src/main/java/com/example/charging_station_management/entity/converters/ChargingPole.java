package com.example.charging_station_management.entity.converters;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "charging_poles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChargingPole {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "station_id", nullable = false)
    private Station station;

    @Column(nullable = false)
    private String manufacturer;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal maxPower;

    @Column(nullable = false)
    private Integer connectorCount = 1;

    private LocalDate installDate;

    @OneToMany(mappedBy = "pole", cascade = CascadeType.ALL)
    private List<ChargingConnector> chargingConnectors;

    @OneToMany(mappedBy = "chargingPole", cascade = CascadeType.ALL)
    private List<Price> prices;
}