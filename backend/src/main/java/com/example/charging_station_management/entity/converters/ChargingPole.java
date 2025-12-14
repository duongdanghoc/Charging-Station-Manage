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

@Entity
@Table(name = "charging_poles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChargingPole {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // 👇 MERGE: Chọn cấu hình tối ưu từ nhánh 'nam'
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "station_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    private Station station;

    @Column(nullable = false)
    private String manufacturer;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal maxPower;

    // Số lượng đầu sạc HIỆN TẠI
    @Column(nullable = false)
    private Integer connectorCount = 0;

    private LocalDate installDate;

    // 👇 MERGE: Chọn cấu hình đầy đủ từ nhánh 'nam' (EAGER + orphanRemoval + Init List)
    @OneToMany(mappedBy = "pole", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    private List<ChargingConnector> chargingConnectors = new ArrayList<>();

    // Giữ lại tính năng Price
    @OneToMany(mappedBy = "pole", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Price> prices = new ArrayList<>();
}