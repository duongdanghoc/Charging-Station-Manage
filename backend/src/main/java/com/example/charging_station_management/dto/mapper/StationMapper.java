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
    
    // 👇 SỬA LỖI #1: Nếu bạn đổi tên List<ChargingPole> trong Entity Station thành 'poles', 
    // thì hãy XÓA dòng này để MapStruct tự map (vì source và target trùng tên)
    // Nếu vẫn cần mapping, hãy đảm bảo tên trường trong Station.java là 'chargingPoles'
    @Mapping(source = "chargingPoles", target = "poles") 
    
    @Mapping(target = "averageRating", constant = "0.0")
    @Mapping(target = "totalRatings", constant = "0")
    StationResponse toResponse(Station station);

    // 👇 SỬA LỖI #2: Đổi source từ "chargingConnectors" sang "connectors"
    @Mapping(source = "connectors", target = "connectors") 
    ChargingPoleResponse toPoleResponse(ChargingPole pole);

    ChargingConnectorResponse toConnectorResponse(ChargingConnector connector);

    List<ChargingPoleResponse> toPoleResponseList(List<ChargingPole> poles);
}