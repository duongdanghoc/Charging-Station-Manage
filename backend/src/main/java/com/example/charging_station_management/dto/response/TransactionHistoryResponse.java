package com.example.charging_station_management.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TransactionHistoryResponse(
        Integer transactionId,
        BigDecimal amount,
        String paymentMethod, // CASH, CREDITCARD, EWALLET...
        String paymentStatus, // PENDING, PAID, FAILED...
        String bankName,
        String accountNumber,
        LocalDateTime paymentTime,
        String description
) {
}
