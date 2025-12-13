package com.example.charging_station_management.dto.mapper;

import com.example.charging_station_management.dto.response.ChargingConnectorResponse;
import com.example.charging_station_management.dto.response.ChargingPoleResponse;
import com.example.charging_station_management.dto.response.StationResponse;
import com.example.charging_station_management.entity.converters.ChargingConnector;
import com.example.charging_station_management.entity.converters.ChargingPole;
import com.example.charging_station_management.entity.converters.Station;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface StationMapper {

    @Mapping(source = "location.addressDetail", target = "address")
    @Mapping(source = "location.province", target = "city")
    @Mapping(source = "location.latitude", target = "latitude")
    @Mapping(source = "location.longitude", target = "longitude")
    @Mapping(source = "vendor.name", target = "vendorName")
    @Mapping(target = "poles", expression = "java(station.getChargingPoles() != null ? station.getChargingPoles().size() : 0)")
    @Mapping(target = "ports", expression = "java(calculateTotalPorts(station))")
    @Mapping(target = "averageRating", constant = "0.0")
    @Mapping(target = "totalRatings", constant = "0")
    @Mapping(target = "status2", expression = "java(mapStatusToString(station.getStatus()))")
    @Mapping(target = "revenue", expression = "java(java.math.BigDecimal.ZERO)")
    StationResponse toResponse(Station station);

    @Mapping(source = "chargingConnectors", target = "connectors")
    ChargingPoleResponse toPoleResponse(ChargingPole pole);

    ChargingConnectorResponse toConnectorResponse(ChargingConnector connector);

    List<ChargingPoleResponse> toPoleResponseList(List<ChargingPole> poles);

    // Tính tổng số cổng sạc (ports)
    default Integer calculateTotalPorts(Station station) {
        if (station.getChargingPoles() == null)
            return 0;
        return station.getChargingPoles().stream()
                .mapToInt(pole -> pole.getChargingConnectors() != null ? pole.getChargingConnectors().size() : 0)
                .sum();
    }

    // Map status Integer sang String
    default String mapStatusToString(Integer status) {
        if (status == null)
            return "Unknown";
        switch (status) {
            case 1:
                return "Active";
            case 0:
                return "Inactive";
            default:
                return "Unknown";
        }
    }
}