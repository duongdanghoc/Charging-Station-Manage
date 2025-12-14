package com.example.charging_station_management.service;

import com.example.charging_station_management.dto.request.TransactionFilterRequest;
import com.example.charging_station_management.dto.response.ChartData;
import com.example.charging_station_management.dto.response.TransactionDetailResponse;
import com.example.charging_station_management.dto.response.VendorRevenueStats;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface TransactionService {
    /**
     * Get all transactions with filters and pagination
     *
     * @param filterRequest Filter criteria
     * @param pageable Pagination and sorting parameters
     * @return Page of transaction details
     */
    Page<TransactionDetailResponse> getAllTransactions(
            TransactionFilterRequest filterRequest,
            Pageable pageable
    );

    /**
     * Get transaction by ID
     *
     * @param transactionId Transaction ID
     * @return Transaction detail
     */
    TransactionDetailResponse getTransactionById(Integer transactionId);

    VendorRevenueStats getVendorRevenueStats(Integer vendorId);

    List<ChartData> getVendorChartData(Integer vendorId, int days);

    List<ChartData> getVendorChartDataByDateRange(Integer vendorId, LocalDate fromDate, LocalDate toDate);
}
