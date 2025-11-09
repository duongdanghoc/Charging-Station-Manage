package com.example.charging_station_management.entity.converters;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.util.List;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
@Entity
@Table(name = "vendors")
@DiscriminatorValue("VENDOR")
@PrimaryKeyJoinColumn(name = "user_id")
public class Vendor extends User{

    @OneToMany(mappedBy = "vendor", cascade = CascadeType.ALL)
    private List<Station> stations;
}
