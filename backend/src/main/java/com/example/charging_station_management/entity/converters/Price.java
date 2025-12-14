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

    // 👇 MERGE: Chọn phiên bản của nhánh 'nam'
    // Lý do: Để khớp với mappedBy="pole" bên ChargingPole.java
    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "charging_pole_id", nullable = false)
    @ToString.Exclude // Thêm cái này để tránh lỗi khi log đối tượng Lazy
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