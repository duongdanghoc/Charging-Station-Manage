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

    // --- MAPPING STATION ---
    @Mapping(source = "location.addressDetail", target = "address")
    @Mapping(source = "location.province", target = "city")
    @Mapping(source = "location.latitude", target = "latitude")
    @Mapping(source = "location.longitude", target = "longitude")
    @Mapping(source = "vendor.name", target = "vendorName")
    
    // Logic tính toán số lượng thay vì map toàn bộ list object (Tối ưu cho API list/map)
    // YÊU CẦU: StationResponse.java phải có field 'poles' kiểu Integer
    @Mapping(target = "poles", expression = "java(station.getChargingPoles() != null ? station.getChargingPoles().size() : 0)")
    @Mapping(target = "ports", expression = "java(calculateTotalPorts(station))")
    
    // Các trường mặc định hoặc tính toán khác
    @Mapping(target = "averageRating", constant = "0.0")
    @Mapping(target = "totalRatings", constant = "0")
    @Mapping(target = "status2", expression = "java(mapStatusToString(station.getStatus()))")
    @Mapping(target = "revenue", expression = "java(java.math.BigDecimal.ZERO)")
    StationResponse toResponse(Station station);


    // --- MAPPING CHARGING POLE ---
    // 👇 Map ID của Station vào DTO response (QUAN TRỌNG)
    @Mapping(source = "station.id", target = "stationId")
    // Lưu ý: source là "chargingConnectors" (tên trong Entity), target là "connectors" (tên trong DTO)
    @Mapping(source = "chargingConnectors", target = "connectors")
    ChargingPoleResponse toPoleResponse(ChargingPole pole);


    // --- MAPPING CONNECTOR ---
    ChargingConnectorResponse toConnectorResponse(ChargingConnector connector);

    // --- LIST MAPPING ---
    List<ChargingPoleResponse> toPoleResponseList(List<ChargingPole> poles);


    // --- HELPER METHODS (Java Expressions) ---

    // 1. Tính tổng số cổng sạc (connectors) của toàn bộ trạm
    default Integer calculateTotalPorts(Station station) {
        if (station.getChargingPoles() == null)
            return 0;
        return station.getChargingPoles().stream()
                .mapToInt(pole -> pole.getChargingConnectors() != null ? pole.getChargingConnectors().size() : 0)
                .sum();
    }

    // 2. Chuyển đổi trạng thái số (Integer) sang chuỗi (String)
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