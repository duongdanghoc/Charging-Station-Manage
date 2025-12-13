package com.example.charging_station_management.dto.mapper;

import com.example.charging_station_management.dto.response.TransactionDetailResponse;
import com.example.charging_station_management.dto.response.TransactionHistoryResponse;
import com.example.charging_station_management.entity.converters.Transaction;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;

@Mapper(componentModel = "spring")
public interface TransactionMapper {

    @Mapping(source = "id", target = "transactionId")
    @Mapping(target = "description", source = ".", qualifiedByName = "buildDescription")
    TransactionHistoryResponse toResponse(Transaction transaction);

    @Named("buildDescription")
    default String buildDescription(Transaction transaction) {
        if (transaction.getChargingSession() == null) {
            return "Giao dịch nạp tiền";
        }
        String stationName = transaction.getChargingSession()
                .getChargingConnector().getPole().getStation().getName();
        return "Thanh toán phiên sạc tại " + stationName;
    }

    // Mapping for detailed response (Admin view)
    @Mapping(source = "id", target = "transactionId")
    @Mapping(source = "amount", target = "amount")
    @Mapping(source = "paymentMethod", target = "paymentMethod")
    @Mapping(source = "paymentStatus", target = "paymentStatus")
    @Mapping(source = "bankName", target = "bankName")
    @Mapping(source = "accountNumber", target = "accountNumber")
    @Mapping(source = "paymentTime", target = "paymentTime")
    @Mapping(source = "createdAt", target = "createdAt")

    // Customer info
    @Mapping(source = "customer.id", target = "customerId")
    @Mapping(source = "customer.name", target = "customerName")
    @Mapping(source = "customer.email", target = "customerEmail")
    @Mapping(source = "customer.phone", target = "customerPhone")

    // Charging session info
    @Mapping(source = "chargingSession.id", target = "sessionId")
    @Mapping(source = "chargingSession.startTime", target = "sessionStartTime")
    @Mapping(source = "chargingSession.endTime", target = "sessionEndTime")
    @Mapping(source = "chargingSession.energyKwh", target = "energyKwh")
    @Mapping(source = "chargingSession.cost", target = "sessionCost")
    @Mapping(source = "chargingSession.status", target = "sessionStatus")

    // Vehicle info
    @Mapping(source = "chargingSession.electricVehicle.id", target = "vehicleId")
    @Mapping(source = "chargingSession.electricVehicle.licensePlate", target = "licensePlate")
    @Mapping(source = "chargingSession.electricVehicle.brand", target = "vehicleBrand")
    @Mapping(source = "chargingSession.electricVehicle.model", target = "vehicleModel")

    // Station info
    @Mapping(source = "chargingSession.chargingConnector.pole.station.id", target = "stationId")
    @Mapping(source = "chargingSession.chargingConnector.pole.station.name", target = "stationName")
    @Mapping(source = "chargingSession.chargingConnector.pole.station.location.province", target = "stationProvince")
    @Mapping(source = "chargingSession.chargingConnector.pole.station.location.addressDetail", target = "stationAddress")
    @Mapping(source = "chargingSession.chargingConnector.pole.station.vendor.name", target = "vendorName")

    // Connector info
    @Mapping(source = "chargingSession.chargingConnector.id", target = "connectorId")
    @Mapping(source = "chargingSession.chargingConnector.connectorType", target = "connectorType")

    // Pole info
    @Mapping(source = "chargingSession.chargingConnector.pole.id", target = "poleId")
    @Mapping(source = "chargingSession.chargingConnector.pole.manufacturer", target = "poleManufacturer")
    TransactionDetailResponse toDetailResponse(Transaction transaction);

}
