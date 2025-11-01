package com.example.charging_station_management.entity.converters;

import com.example.charging_station_management.entity.enums.ConnectorType;
import com.example.charging_station_management.entity.enums.VehicleType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "electric_vehicles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ElectricVehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "station_type")
    private VehicleType vehicleType;

    @Column(nullable = false)
    private String brand;

    @Column(nullable = false)
    private String model;

    @Column(nullable = false, unique = true, length = 50)
    private String licensePlate;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal batteryCapacity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "connector_type")
    private ConnectorType connectorType;

    @OneToMany(mappedBy = "electricVehicle", cascade = CascadeType.ALL)
    private List<ChargingSession> chargingSessions;
}