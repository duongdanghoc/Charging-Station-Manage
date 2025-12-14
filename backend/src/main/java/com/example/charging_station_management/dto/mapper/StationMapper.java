package com.example.charging_station_management.dto.mapper;

import com.example.charging_station_management.dto.response.ChargingConnectorResponse;
import com.example.charging_station_management.dto.response.ChargingPoleResponse;
import com.example.charging_station_management.dto.response.StationResponse;
import com.example.charging_station_management.entity.converters.ChargingConnector;
import com.example.charging_station_management.entity.converters.ChargingPole;
import com.example.charging_station_management.entity.converters.Station;
import com.example.charging_station_management.entity.enums.ConnectorStatus;
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
    
    // Logic tính toán số lượng
    @Mapping(target = "poles", expression = "java(station.getChargingPoles() != null ? station.getChargingPoles().size() : 0)")
    @Mapping(target = "ports", expression = "java(calculateTotalPorts(station))")
    @Mapping(target = "activePorts", expression = "java(calculateActivePorts(station))")
    
    // Các trường mặc định hoặc tính toán khác
    @Mapping(target = "averageRating", constant = "0.0")
    @Mapping(target = "totalRatings", constant = "0")
    @Mapping(target = "status2", expression = "java(mapStatusToString(station.getStatus()))")
    @Mapping(target = "revenue", expression = "java(java.math.BigDecimal.ZERO)")
    StationResponse toResponse(Station station);


    // --- MAPPING CHARGING POLE ---
    @Mapping(source = "station.id", target = "stationId")
    @Mapping(source = "chargingConnectors", target = "connectors")
    // Map thêm trường maxConnectors (nếu DTO Response đã có)
    @Mapping(source = "maxConnectors", target = "maxConnectors") 
    ChargingPoleResponse toPoleResponse(ChargingPole pole);


    // --- MAPPING CONNECTOR ---
    ChargingConnectorResponse toConnectorResponse(ChargingConnector connector);

    // --- LIST MAPPING ---
    List<ChargingPoleResponse> toPoleResponseList(List<ChargingPole> poles);


    // --- HELPER METHODS (Java Expressions) ---

    // 1. Tính tổng số cổng sạc (connectors) của toàn bộ trạm
    default Integer calculateTotalPorts(Station station) {
        if (station.getChargingPoles() == null) {
            return 0;
        }
        return station.getChargingPoles().stream()
                .mapToInt(pole -> pole.getChargingConnectors() != null ? pole.getChargingConnectors().size() : 0)
                .sum();
    }

    // 2. Tính tổng số cổng sạc đang SẴN SÀNG (AVAILABLE)
    default Integer calculateActivePorts(Station station) {
        if (station.getChargingPoles() == null) {
            return 0;
        }
        return station.getChargingPoles().stream()
                .mapToInt(pole -> {
                    if (pole.getChargingConnectors() == null) return 0;
                    return (int) pole.getChargingConnectors().stream()
                            .filter(c -> ConnectorStatus.AVAILABLE.equals(c.getStatus()))
                            .count();
                })
                .sum();
    }

    // 3. Chuyển đổi trạng thái số (Integer) sang chuỗi (String)
    default String mapStatusToString(Integer status) {
        if (status == null) {
            return "Unknown";
        }
        return switch (status) {
            case 1 -> "Active";
            case 0 -> "Inactive";
            default -> "Unknown";
        };
    }
}