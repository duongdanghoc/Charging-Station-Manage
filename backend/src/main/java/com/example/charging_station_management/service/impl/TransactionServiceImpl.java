package com.example.charging_station_management.service.impl;

import com.example.charging_station_management.dto.mapper.TransactionMapper;
import com.example.charging_station_management.dto.request.TransactionFilterRequest;
import com.example.charging_station_management.dto.response.TransactionDetailResponse;
import com.example.charging_station_management.entity.converters.Transaction;
import com.example.charging_station_management.repository.TransactionRepository;
import com.example.charging_station_management.service.TransactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final TransactionMapper transactionMapper;

    @Override
    public Page<TransactionDetailResponse> getAllTransactions(
            TransactionFilterRequest filterRequest,
            Pageable pageable) {

        log.info("Fetching transactions with filters: {}", filterRequest);

        Page<Transaction> transactions = transactionRepository.searchTransactions(
                filterRequest.getCustomerId(),
                filterRequest.getStationId(),
                filterRequest.getPaymentStatus(),
                filterRequest.getPaymentMethod(),
                filterRequest.getPaymentTimeFrom(),
                filterRequest.getPaymentTimeTo(),
                filterRequest.getCreatedAtFrom(),
                filterRequest.getCreatedAtTo(),
                filterRequest.getAmountFrom(),
                filterRequest.getAmountTo(),
                filterRequest.getCustomerName(),
                filterRequest.getStationName(),
                filterRequest.getBankName(),
                pageable
        );

        log.info("Found {} transactions", transactions.getTotalElements());

        return transactions.map(transactionMapper::toDetailResponse);
    }

    @Override
    public TransactionDetailResponse getTransactionById(Integer transactionId) {
        log.info("Fetching transaction with id: {}", transactionId);

        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> {
                    log.error("Transaction not found with id: {}", transactionId);
                    return new RuntimeException("Transaction not found: " + transactionId);
                });

        return transactionMapper.toDetailResponse(transaction);
    }

}
