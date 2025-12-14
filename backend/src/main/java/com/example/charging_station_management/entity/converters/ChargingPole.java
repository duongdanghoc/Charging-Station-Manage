package com.example.charging_station_management.entity.converters;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
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

    // --- Quan hệ ManyToOne với Station ---
    @ManyToOne(fetch = FetchType.LAZY) 
    @JoinColumn(name = "station_id", nullable = false)
    @JsonIgnore 
    @ToString.Exclude
    @EqualsAndHashCode.Exclude // Ngăn chặn lỗi StackOverflow do Lombok
    private Station station;

    @Column(nullable = false)
    private String manufacturer;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal maxPower;

    // 👇 QUAN TRỌNG: Map biến này vào cột 'connector_count' có sẵn trong DB
    // để lưu giới hạn số lượng đầu sạc mà không cần tạo cột mới trong DB.
    @Column(name = "connector_count", nullable = false)
    private Integer maxConnectors = 2;

    // ❌ Đã xóa biến connectorCount để tránh lỗi "Repeated column mapping"
    // (Vì cột connector_count giờ đã được dùng cho maxConnectors ở trên)

    private LocalDate installDate;

    // --- Quan hệ OneToMany với Connector ---
    @OneToMany(mappedBy = "pole", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    private List<ChargingConnector> chargingConnectors = new ArrayList<>();

    // --- Quan hệ OneToMany với Price ---
    @OneToMany(mappedBy = "pole", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Price> prices = new ArrayList<>();
}