package com.example.charging_station_management.entity.converters;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import com.example.charging_station_management.entity.converters.Station; 
import com.example.charging_station_management.entity.converters.ChargingConnector;
import com.example.charging_station_management.entity.converters.Price;

@Entity
@Table(name = "charging_poles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChargingPole {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "station_id", nullable = false)
    @JsonIgnore // Tránh vòng lặp vô tận khi serialize JSON
    @ToString.Exclude
    private Station station;

    @Column(nullable = false)
    private String manufacturer;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal maxPower;

    // Số lượng đầu sạc HIỆN TẠI (Mới tạo thì là 0)
    @Column(nullable = false)
    private Integer connectorCount = 0;

    private LocalDate installDate;

    // mappedBy phải trùng với tên biến trong class ChargingConnector (private ChargingPole chargingPole;)
    @OneToMany(mappedBy = "pole", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChargingConnector> connectors = new ArrayList<>();

    @OneToMany(mappedBy = "pole", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Price> prices = new ArrayList<>();
}