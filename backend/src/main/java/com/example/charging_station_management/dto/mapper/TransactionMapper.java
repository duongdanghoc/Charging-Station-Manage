package com.example.charging_station_management.dto.mapper;

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
}
