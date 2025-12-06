package com.example.charging_station_management.dto.mapper;

import com.example.charging_station_management.dto.response.ChargingHistoryResponse;
import com.example.charging_station_management.entity.converters.ChargingSession;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ChargingSessionMapper {

    @Mapping(source = "id", target = "sessionId")
    @Mapping(source = "chargingConnector.pole.station.name", target = "stationName")
    @Mapping(source = "chargingConnector.pole.station.location.addressDetail", target = "address")
    @Mapping(source = "electricVehicle.licensePlate", target = "vehiclePlate")
    @Mapping(source = "status", target = "sessionStatus")
    @Mapping(source = "transaction.amount", target = "totalAmount")
    @Mapping(source = "transaction.paymentStatus", target = "paymentStatus")
    @Mapping(source = "transaction.paymentMethod", target = "paymentMethod")
    ChargingHistoryResponse toHistoryResponse(ChargingSession session);
}
