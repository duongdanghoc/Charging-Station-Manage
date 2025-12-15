package com.example.charging_station_management.dto.mapper;

import com.example.charging_station_management.dto.response.ChargingHistoryResponse;
import com.example.charging_station_management.dto.response.ChargingSessionDetailResponse;
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
    @Mapping(source = "cost", target = "amount")
    @Mapping(source = "transaction.paymentStatus", target = "paymentStatus")
    @Mapping(source = "transaction.paymentMethod", target = "paymentMethod")
    ChargingHistoryResponse toHistoryResponse(ChargingSession session);

    // Mapping for detailed response (Admin view)
    @Mapping(source = "id", target = "sessionId")
    @Mapping(source = "startTime", target = "startTime")
    @Mapping(source = "endTime", target = "endTime")
    @Mapping(source = "energyKwh", target = "energyKwh")
    @Mapping(source = "cost", target = "cost")
    @Mapping(source = "status", target = "status")

    // Customer info
    @Mapping(source = "electricVehicle.customer.id", target = "customerId")
    @Mapping(source = "electricVehicle.customer.name", target = "customerName")
    @Mapping(source = "electricVehicle.customer.email", target = "customerEmail")
    @Mapping(source = "electricVehicle.customer.phone", target = "customerPhone")

    // Vehicle info
    @Mapping(source = "electricVehicle.id", target = "vehicleId")
    @Mapping(source = "electricVehicle.licensePlate", target = "licensePlate")
    @Mapping(source = "electricVehicle.brand", target = "vehicleBrand")
    @Mapping(source = "electricVehicle.model", target = "vehicleModel")
    @Mapping(source = "electricVehicle.vehicleType", target = "vehicleType")
    @Mapping(source = "electricVehicle.connectorType", target = "vehicleConnectorType")
    @Mapping(source = "electricVehicle.batteryCapacity", target = "batteryCapacity")

    // Station info
    @Mapping(source = "chargingConnector.pole.station.id", target = "stationId")
    @Mapping(source = "chargingConnector.pole.station.name", target = "stationName")
    @Mapping(source = "chargingConnector.pole.station.location.province", target = "stationProvince")
    @Mapping(source = "chargingConnector.pole.station.location.addressDetail", target = "stationAddress")
    @Mapping(source = "chargingConnector.pole.station.vendor.name", target = "vendorName")

    // Pole info
    @Mapping(source = "chargingConnector.pole.id", target = "poleId")
    @Mapping(source = "chargingConnector.pole.manufacturer", target = "poleManufacturer")
    @Mapping(source = "chargingConnector.pole.maxPower", target = "poleMaxPower")

    // Connector info
    @Mapping(source = "chargingConnector.id", target = "connectorId")
    @Mapping(source = "chargingConnector.connectorType", target = "connectorType")
    @Mapping(source = "chargingConnector.maxPower", target = "connectorMaxPower")
    @Mapping(source = "chargingConnector.status", target = "connectorStatus")

    // Transaction info
    @Mapping(source = "transaction.id", target = "transactionId")
    @Mapping(source = "transaction.paymentMethod", target = "paymentMethod")
    @Mapping(source = "transaction.paymentStatus", target = "paymentStatus")
    @Mapping(source = "transaction.paymentTime", target = "paymentTime")
    ChargingSessionDetailResponse toDetailResponse(ChargingSession session);
}
