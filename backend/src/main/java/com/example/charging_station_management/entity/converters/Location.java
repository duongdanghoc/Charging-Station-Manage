package com.example.charging_station_management.entity.converters;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "locations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Location {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Integer id;

  @Column(nullable = false, precision = 10, scale = 8)
  private BigDecimal latitude;

  @Column(nullable = false, precision = 11, scale = 8)
  private BigDecimal longitude;

  @Column(nullable = false)
  private String province;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String addressDetail;

    @JsonIgnore
    @OneToMany(mappedBy = "location", cascade = CascadeType.ALL)
    private List<Station> stations;

    @JsonIgnore
    @OneToMany(mappedBy = "location", cascade = CascadeType.ALL)
    private List<RescueStation> rescueStations;
}
