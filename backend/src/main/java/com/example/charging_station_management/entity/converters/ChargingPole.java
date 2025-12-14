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

    // --- Quan hệ ManyToOne với Station (Giữ LAZY và JsonIgnore) ---
    @ManyToOne(fetch = FetchType.LAZY) // Chọn LAZY để tối ưu hiệu năng
    @JoinColumn(name = "station_id", nullable = false)
    @JsonIgnore // Ngăn vòng lặp vô tận khi in JSON
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

    // --- Quan hệ OneToMany với Connector (Giữ cấu hình đầy đủ và khởi tạo List) ---
    @OneToMany(mappedBy = "pole", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    private List<ChargingConnector> chargingConnectors = new ArrayList<>(); // Khởi tạo để tránh NPE

    // Giữ lại tính năng Price
    @OneToMany(mappedBy = "pole", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Price> prices = new ArrayList<>();
}