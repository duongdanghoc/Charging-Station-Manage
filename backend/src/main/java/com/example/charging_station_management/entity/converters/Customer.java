package com.example.charging_station_management.entity.converters;

import com.example.charging_station_management.entity.enums.UserStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Entity
@Table(name = "customers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(length = 11)
    private String phone;

    @Enumerated(EnumType.STRING)
    @Column(columnDefinition = "user_status")
    private UserStatus status = UserStatus.ACTIVE;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL)
    private List<ElectricVehicle> electricVehicles;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL)
    private List<Rating> ratings;

    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL)
    private List<Transaction> transactions;
}