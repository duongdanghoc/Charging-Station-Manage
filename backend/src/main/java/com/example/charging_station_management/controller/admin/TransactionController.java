package com.example.charging_station_management.controller.admin;

import com.example.charging_station_management.dto.request.TransactionFilterRequest;
import com.example.charging_station_management.dto.response.TransactionDetailResponse;
import com.example.charging_station_management.entity.enums.PaymentMethod;
import com.example.charging_station_management.entity.enums.PaymentStatus;
import com.example.charging_station_management.service.TransactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:8080" })
@PreAuthorize("hasRole('ADMIN')")
public class TransactionController {

    private final TransactionService transactionService;

    @GetMapping("/transactions")
    public ResponseEntity<?> getAllTransactions(
            @RequestParam(required = false) Integer customerId,
            @RequestParam(required = false) Integer stationId,
            @RequestParam(required = false) PaymentStatus paymentStatus,
            @RequestParam(required = false) PaymentMethod paymentMethod,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime paymentTimeFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime paymentTimeTo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime createdAtFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime createdAtTo,
            @RequestParam(required = false) BigDecimal amountFrom,
            @RequestParam(required = false) BigDecimal amountTo,
            @RequestParam(required = false) String customerName,
            @RequestParam(required = false) String stationName,
            @RequestParam(required = false) String bankName,
            @PageableDefault(size = 10, page = 0, sort = "paymentTime", direction = Sort.Direction.DESC) Pageable pageable) {

        try {
            log.info("Admin requesting transactions - customerId: {}, stationId: {}, paymentStatus: {}, page: {}, size: {}",
                    customerId, stationId, paymentStatus, pageable.getPageNumber(), pageable.getPageSize());

            TransactionFilterRequest filterRequest = TransactionFilterRequest.builder()
                    .customerId(customerId)
                    .stationId(stationId)
                    .paymentStatus(paymentStatus)
                    .paymentMethod(paymentMethod)
                    .paymentTimeFrom(paymentTimeFrom)
                    .paymentTimeTo(paymentTimeTo)
                    .createdAtFrom(createdAtFrom)
                    .createdAtTo(createdAtTo)
                    .amountFrom(amountFrom)
                    .amountTo(amountTo)
                    .customerName(customerName)
                    .stationName(stationName)
                    .bankName(bankName)
                    .build();

            Page<TransactionDetailResponse> transactions = transactionService.getAllTransactions(filterRequest, pageable);

            log.info("Successfully retrieved {} transactions (total: {})",
                    transactions.getNumberOfElements(), transactions.getTotalElements());

            return ResponseEntity.ok(transactions);

        } catch (Exception e) {
            log.error("Error retrieving transactions", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to retrieve transactions: " + e.getMessage()));
        }
    }

    @GetMapping("/transactions/{transactionId}")
    public ResponseEntity<?> getTransactionById(@PathVariable Integer transactionId) {
        try {
            log.info("Admin requesting transaction detail - transactionId: {}", transactionId);

            TransactionDetailResponse transaction = transactionService.getTransactionById(transactionId);

            log.info("Successfully retrieved transaction: {}", transactionId);

            return ResponseEntity.ok(transaction);

        } catch (RuntimeException e) {
            log.error("Error retrieving transaction: {}", transactionId, e);
            return ResponseEntity.status(404)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error retrieving transaction: {}", transactionId, e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Failed to retrieve transaction: " + e.getMessage()));
        }
    }
}
