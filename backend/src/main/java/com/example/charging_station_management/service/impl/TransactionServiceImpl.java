package com.example.charging_station_management.service.impl;

import com.example.charging_station_management.dto.request.TransactionFilterRequest;
import com.example.charging_station_management.dto.response.TransactionDetailResponse;
import com.example.charging_station_management.entity.converters.*;
import com.example.charging_station_management.repository.TransactionRepository;
import com.example.charging_station_management.service.TransactionService;
import com.example.charging_station_management.repository.specification.TransactionSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;

    @Override
    public Page<TransactionDetailResponse> getAllTransactions(
            TransactionFilterRequest filterRequest,
            Pageable pageable) {

        Specification<Transaction> spec = Specification.where(null);

        if (filterRequest != null) {
            spec = spec
                    .and(TransactionSpecification.withCustomerId(filterRequest.getCustomerId()))
                    .and(TransactionSpecification.withStationId(filterRequest.getStationId()))
                    .and(TransactionSpecification.withPaymentStatus(filterRequest.getPaymentStatus()))
                    .and(TransactionSpecification.withPaymentMethod(filterRequest.getPaymentMethod()))
                    .and(TransactionSpecification.withPaymentTimeBetween(
                            filterRequest.getPaymentTimeFrom(),
                            filterRequest.getPaymentTimeTo()))
                    .and(TransactionSpecification.withCreatedAtBetween(
                            filterRequest.getCreatedAtFrom(),
                            filterRequest.getCreatedAtTo()))
                    .and(TransactionSpecification.withAmountBetween(
                            filterRequest.getAmountFrom(),
                            filterRequest.getAmountTo()))
                    .and(TransactionSpecification.withCustomerNameLike(filterRequest.getCustomerName()))
                    .and(TransactionSpecification.withStationNameLike(filterRequest.getStationName()))
                    .and(TransactionSpecification.withBankNameLike(filterRequest.getBankName()));
        }

        Page<Transaction> transactions = transactionRepository.findAll(spec, pageable);

        return transactions.map(this::convertToDetailResponse);
    }

    @Override
    public TransactionDetailResponse getTransactionById(Integer transactionId) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found with id: " + transactionId));

        return convertToDetailResponse(transaction);
    }

    private TransactionDetailResponse convertToDetailResponse(Transaction transaction) {
        // Customer extends User, nên có thể truy cập trực tiếp
        Customer customer = transaction.getCustomer();

        ChargingSession session = transaction.getChargingSession();
        ElectricVehicle vehicle = session != null ? session.getElectricVehicle() : null;
        ChargingConnector connector = session != null ? session.getChargingConnector() : null;
        ChargingPole pole = connector != null ? connector.getPole() : null;
        Station station = pole != null ? pole.getStation() : null;
        Location location = station != null ? station.getLocation() : null;
        Vendor vendor = station != null ? station.getVendor() : null;

        return TransactionDetailResponse.builder()
                // Transaction info
                .transactionId(transaction.getId())
                .amount(transaction.getAmount())
                .paymentMethod(transaction.getPaymentMethod())
                .paymentStatus(transaction.getPaymentStatus())
                .bankName(transaction.getBankName())
                .accountNumber(transaction.getAccountNumber())
                .paymentTime(transaction.getPaymentTime())
                .createdAt(transaction.getCreatedAt())

                // Customer info (Customer IS-A User)
                .customerId(customer != null ? customer.getId() : null)
                .customerName(customer != null ? customer.getName() : null)
                .customerEmail(customer != null ? customer.getEmail() : null)
                .customerPhone(customer != null ? customer.getPhone() : null)

                // Charging session info
                .sessionId(session != null ? session.getId() : null)
                .sessionStartTime(session != null ? session.getStartTime() : null)
                .sessionEndTime(session != null ? session.getEndTime() : null)
                .energyKwh(session != null ? session.getEnergyKwh() : null)
                .sessionCost(session != null ? session.getCost() : null)
                .sessionStatus(session != null ? session.getStatus() : null)

                // Vehicle info
                .vehicleId(vehicle != null ? vehicle.getId() : null)
                .licensePlate(vehicle != null ? vehicle.getLicensePlate() : null)
                .vehicleBrand(vehicle != null ? vehicle.getBrand() : null)
                .vehicleModel(vehicle != null ? vehicle.getModel() : null)

                // Station info
                .stationId(station != null ? station.getId() : null)
                .stationName(station != null ? station.getName() : null)
                .stationProvince(location != null ? location.getProvince() : null)
                .stationAddress(location != null ? location.getAddressDetail() : null)
                .vendorName(vendor != null ? vendor.getName() : null)

                // Connector info
                .connectorId(connector != null ? connector.getId() : null)
                .connectorType(connector != null && connector.getConnectorType() != null ?
                        connector.getConnectorType().toString() : null)

                // Pole info
                .poleId(pole != null ? pole.getId() : null)
                .poleManufacturer(pole != null ? pole.getManufacturer() : null)
                .build();
    }
}
