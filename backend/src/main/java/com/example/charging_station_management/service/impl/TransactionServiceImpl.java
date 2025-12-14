package com.example.charging_station_management.service.impl;

import com.example.charging_station_management.dto.mapper.VendorStatsMapper;
import com.example.charging_station_management.dto.request.TransactionFilterRequest;
import com.example.charging_station_management.dto.response.ChartData;
import com.example.charging_station_management.dto.response.TransactionDetailResponse;
import com.example.charging_station_management.entity.converters.*;
import com.example.charging_station_management.dto.response.VendorRevenueStats;
import com.example.charging_station_management.entity.enums.PaymentStatus;
import com.example.charging_station_management.repository.TransactionRepository;
import com.example.charging_station_management.service.TransactionService;
import com.example.charging_station_management.repository.specification.TransactionSpecification;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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
    private final VendorStatsMapper vendorStatsMapper;

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
                .connectorType(connector != null && connector.getConnectorType() != null
                        ? connector.getConnectorType().toString()
                        : null)

                // Pole info
                .poleId(pole != null ? pole.getId() : null)
                .poleManufacturer(pole != null ? pole.getManufacturer() : null)
                .build();
    }

    private BigDecimal calculateTotalRevenue(List<Transaction> transactions) {
        if (transactions == null || transactions.isEmpty()) {
            return BigDecimal.ZERO;
        }
        return transactions.stream()
                .filter(t -> t.getAmount() != null)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Override
    public VendorRevenueStats getVendorRevenueStats(Integer vendorId) {
        LocalDateTime now = LocalDateTime.now();

        // 1. Xác định khung thời gian chuẩn xác
        LocalDateTime startOfDay = now.toLocalDate().atStartOfDay();
        LocalDateTime endOfDay = now.toLocalDate().atTime(LocalTime.MAX);

        LocalDateTime startOfMonth = now.withDayOfMonth(1).toLocalDate().atStartOfDay();
        LocalDateTime endOfMonth = now.toLocalDate().atTime(LocalTime.MAX);

        // Tháng trước: Từ ngày 1 tháng trước -> Giây cuối cùng của tháng trước
        LocalDateTime startOfLastMonth = now.minusMonths(1).withDayOfMonth(1).toLocalDate().atStartOfDay();
        LocalDateTime endOfLastMonth = now.withDayOfMonth(1).toLocalDate().atStartOfDay().minusSeconds(1);

        // 2. Gọi Repo (Sử dụng hàm mới viết lại)
        List<Transaction> dailyTxs = transactionRepository.findTransactionsByVendorAndDateRange(
                vendorId, PaymentStatus.PAID, startOfDay, endOfDay);

        List<Transaction> monthlyTxs = transactionRepository.findTransactionsByVendorAndDateRange(
                vendorId, PaymentStatus.PAID, startOfMonth, endOfMonth);

        List<Transaction> lastMonthTxs = transactionRepository.findTransactionsByVendorAndDateRange(
                vendorId, PaymentStatus.PAID, startOfLastMonth, endOfLastMonth);

        // 3. Tính toán
        BigDecimal dailyRevenue = calculateTotalRevenue(dailyTxs);
        BigDecimal monthlyRevenue = calculateTotalRevenue(monthlyTxs);
        BigDecimal lastMonthRevenue = calculateTotalRevenue(lastMonthTxs);

        // Mapping dữ liệu trả về
        return vendorStatsMapper.toRevenueStats(dailyRevenue, monthlyRevenue, lastMonthRevenue);
    }

    @Override
    public List<ChartData> getVendorChartData(Integer vendorId, int days) {
        // Lấy dữ liệu đến hết ngày hiện tại
        LocalDateTime endDate = LocalDateTime.now().toLocalDate().atTime(LocalTime.MAX);
        // Lùi lại 'days' ngày bắt đầu từ 00:00:00
        LocalDateTime startDate = LocalDateTime.now().minusDays(days - 1).toLocalDate().atStartOfDay();

        // 1. Lấy toàn bộ transaction trong khoảng thời gian (Query 1 lần duy nhất)
        List<Transaction> transactions = transactionRepository.findTransactionsByVendorAndDateRange(
                vendorId, PaymentStatus.PAID, startDate, endDate);

        // 2. Group by Date tại Service (Java Stream)
        // Key: LocalDate, Value: List<Transaction> trong ngày đó
        Map<LocalDate, List<Transaction>> groupedByDate = transactions.stream()
                .collect(Collectors.groupingBy(
                        t -> t.getPaymentTime().toLocalDate()));

        // 3. Loop tạo data cho biểu đồ (Fill gap - điền vào những ngày không có doanh
        // thu)
        List<ChartData> result = new ArrayList<>();
        DateTimeFormatter displayFormatter = DateTimeFormatter.ofPattern("dd/MM");

        for (int i = 0; i < days; i++) {
            // Tính toán ngày đang xét trong vòng lặp
            LocalDate loopDate = startDate.plusDays(i).toLocalDate();

            // Lấy list transaction của ngày đó từ Map, nếu null thì trả về list rỗng
            List<Transaction> txsInDay = groupedByDate.getOrDefault(loopDate, new ArrayList<>());

            BigDecimal revenue = calculateTotalRevenue(txsInDay);
            long sessionCount = txsInDay.size();

            result.add(ChartData.builder()
                    .date(loopDate.format(displayFormatter))
                    .revenue(revenue)
                    .sessions(sessionCount)
                    .build());
        }

        return result;
    }

    @Override
    public List<ChartData> getVendorChartDataByDateRange(Integer vendorId, LocalDate fromDate, LocalDate toDate) {
        if (fromDate == null) fromDate = LocalDate.now().minusDays(30);
        if (toDate == null) toDate = LocalDate.now();

        // 1. Convert LocalDate sang LocalDateTime để query DB
        LocalDateTime startDateTime = fromDate.atStartOfDay();
        LocalDateTime endDateTime = toDate.atTime(LocalTime.MAX);

        // 2. Reuse hàm query repository có sẵn
        List<Transaction> transactions = transactionRepository.findTransactionsByVendorAndDateRange(
                vendorId, PaymentStatus.PAID, startDateTime, endDateTime);

        // 3. Group transaction theo ngày
        Map<LocalDate, List<Transaction>> groupedByDate = transactions.stream()
                .collect(Collectors.groupingBy(t -> t.getPaymentTime().toLocalDate()));

        // 4. Loop qua từng ngày trong khoảng thời gian để tạo data (Fill gap những ngày
        // không có doanh thu)
        List<ChartData> result = new ArrayList<>();
        DateTimeFormatter displayFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy"); // Format đầy đủ hơn cho range
                                                                                        // tùy chỉnh

        // Lưu ý: limit loop để tránh vô hạn nếu fromDate > toDate, hoặc range quá lớn
        LocalDate currentDate = fromDate;
        while (!currentDate.isAfter(toDate)) {
            List<Transaction> txsInDay = groupedByDate.getOrDefault(currentDate, new ArrayList<>());

            BigDecimal revenue = calculateTotalRevenue(txsInDay);
            long sessionCount = txsInDay.size();

            result.add(ChartData.builder()
                    .date(currentDate.format(displayFormatter)) // Trả về string date
                    .revenue(revenue)
                    .sessions(sessionCount)
                    .build());

            currentDate = currentDate.plusDays(1);
        }

        return result;
    }
}
