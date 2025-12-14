package com.example.charging_station_management.entity.converters;

import com.example.charging_station_management.entity.enums.PriceName;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

@Builder
@Entity
@Table(name = "prices")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Price {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // ✅ MERGE: 
    // 1. Giữ @JsonIgnore để tránh lỗi JSON loop.
    // 2. Tên biến phải là 'pole' để khớp với mappedBy="pole" bên ChargingPole.
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY) // Nên thêm LAZY để tối ưu hiệu năng
    @JoinColumn(name = "charging_pole_id", nullable = false) 
    private ChargingPole pole; 

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 100)
    private PriceName name;

    @Column(precision = 15, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private LocalDate effectiveFrom;

    private LocalDate effectiveTo;

    @Column(nullable = false)
    private LocalTime startTime;

    @Column(nullable = false)
    private LocalTime endTime;
}