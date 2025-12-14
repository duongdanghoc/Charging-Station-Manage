package com.example.charging_station_management.entity.converters;

import com.example.charging_station_management.entity.enums.PriceName;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

// Đảm bảo import ChargingPole là đúng. 
// Nếu ChargingPole nằm trong cùng package này, bạn không cần import.
// Nếu ChargingPole nằm ở package khác, bạn cần thêm dòng: 
// import com.example.charging_station_management.entity.converters.ChargingPole; 
// (Tùy thuộc vào vị trí thực tế của ChargingPole.java)

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

    // 👇 ĐÃ SỬA: Đổi tên biến thành 'pole' để khớp với mappedBy = "pole" trong ChargingPole.java
    @ManyToOne
    @JoinColumn(name = "charging_pole_id") 
    private ChargingPole pole; // <-- Tên biến phải là 'pole'

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