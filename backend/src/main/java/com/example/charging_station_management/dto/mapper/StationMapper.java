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
    @Mapping(source = "chargingPoles", target = "poles")
    StationResponse toResponse(Station station);

    @Mapping(source = "chargingConnectors", target = "connectors") 
    ChargingPoleResponse toPoleResponse(ChargingPole pole);

    ChargingConnectorResponse toConnectorResponse(ChargingConnector connector);

    List<ChargingPoleResponse> toPoleResponseList(List<ChargingPole> poles);
}
