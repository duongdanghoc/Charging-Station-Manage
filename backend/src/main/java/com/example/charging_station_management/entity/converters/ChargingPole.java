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

// Đảm bảo import đúng các entity liên quan
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

    // ✅ Quyết định: Dùng FetchType.LAZY để tối ưu (chuẩn Hibernate)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "station_id", nullable = false)
    @JsonIgnore
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

    // ✅ Quyết định quan trọng:
    // 1. Tên biến: Giữ 'chargingConnectors' (để khớp với code hiện tại của bạn).
    // 2. Fetch: Giữ EAGER (để StationMapper tính toán được số cổng mà không lỗi Lazy).
    // 3. OrphanRemoval: Thêm vào để quản lý dữ liệu chặt chẽ hơn (từ nhánh Nam).
    @OneToMany(mappedBy = "pole", cascade = CascadeType.ALL, fetch = FetchType.EAGER, orphanRemoval = true)
    private List<ChargingConnector> chargingConnectors = new ArrayList<>();

    // ✅ Giữ lại tính năng Price từ nhánh của Nam
    @OneToMany(mappedBy = "pole", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Price> prices = new ArrayList<>();
}