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
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
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
            Page<TransactionDetailResponse> transactions = transactionService.getAllTransactions(filterRequest,
                    pageable);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Successfully retrieved transactions");
            response.put("data", createPageResponse(transactions));
            response.put("timestamp", LocalDateTime.now());

            return ResponseEntity.ok(response);

        } catch (Exception e) {

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to retrieve transactions");
            errorResponse.put("error", e.getMessage());
            errorResponse.put("timestamp", LocalDateTime.now());

            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    @GetMapping("/transactions/{transactionId}")
    public ResponseEntity<?> getTransactionById(@PathVariable Integer transactionId) {
        try {

            TransactionDetailResponse transaction = transactionService.getTransactionById(transactionId);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Successfully retrieved transaction");
            response.put("data", transaction);
            response.put("timestamp", LocalDateTime.now());

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", e.getMessage());
            errorResponse.put("transactionId", transactionId);
            errorResponse.put("timestamp", LocalDateTime.now());

            return ResponseEntity.status(404).body(errorResponse);

        } catch (Exception e) {

            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("success", false);
            errorResponse.put("message", "Failed to retrieve transaction");
            errorResponse.put("error", e.getMessage());
            errorResponse.put("timestamp", LocalDateTime.now());

            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }

    private Map<String, Object> createPageResponse(Page<TransactionDetailResponse> page) {
        Map<String, Object> pageResponse = new HashMap<>();

        pageResponse.put("content", page.getContent());
        pageResponse.put("pageNumber", page.getNumber());
        pageResponse.put("pageSize", page.getSize());
        pageResponse.put("totalElements", page.getTotalElements());
        pageResponse.put("totalPages", page.getTotalPages());
        pageResponse.put("last", page.isLast());
        pageResponse.put("first", page.isFirst());
        pageResponse.put("empty", page.isEmpty());
        pageResponse.put("numberOfElements", page.getNumberOfElements());

        return pageResponse;
    }
}
