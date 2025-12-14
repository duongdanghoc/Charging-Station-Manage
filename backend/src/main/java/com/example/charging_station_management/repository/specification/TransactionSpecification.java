package com.example.charging_station_management.repository.specification;

import com.example.charging_station_management.entity.converters.Transaction;
import com.example.charging_station_management.entity.enums.PaymentMethod;
import com.example.charging_station_management.entity.enums.PaymentStatus;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TransactionSpecification {

    public static Specification<Transaction> withCustomerId(Integer customerId) {
        return (root, query, cb) ->
                customerId == null ? cb.conjunction() : cb.equal(root.get("customer").get("id"), customerId);
    }

    public static Specification<Transaction> withStationId(Integer stationId) {
        return (root, query, cb) ->
                stationId == null ? cb.conjunction() :
                        cb.equal(root.get("chargingSession").get("chargingConnector").get("pole").get("station").get("id"), stationId);
    }

    public static Specification<Transaction> withPaymentStatus(PaymentStatus status) {
        return (root, query, cb) ->
                status == null ? cb.conjunction() : cb.equal(root.get("paymentStatus"), status);
    }

    public static Specification<Transaction> withPaymentMethod(PaymentMethod method) {
        return (root, query, cb) ->
                method == null ? cb.conjunction() : cb.equal(root.get("paymentMethod"), method);
    }

    public static Specification<Transaction> withPaymentTimeBetween(LocalDateTime from, LocalDateTime to) {
        return (root, query, cb) -> {
            if (from == null && to == null) return cb.conjunction();
            if (from == null) return cb.lessThanOrEqualTo(root.get("paymentTime"), to);
            if (to == null) return cb.greaterThanOrEqualTo(root.get("paymentTime"), from);
            return cb.between(root.get("paymentTime"), from, to);
        };
    }

    public static Specification<Transaction> withCreatedAtBetween(LocalDateTime from, LocalDateTime to) {
        return (root, query, cb) -> {
            if (from == null && to == null) return cb.conjunction();
            if (from == null) return cb.lessThanOrEqualTo(root.get("createdAt"), to);
            if (to == null) return cb.greaterThanOrEqualTo(root.get("createdAt"), from);
            return cb.between(root.get("createdAt"), from, to);
        };
    }

    public static Specification<Transaction> withAmountBetween(BigDecimal from, BigDecimal to) {
        return (root, query, cb) -> {
            if (from == null && to == null) return cb.conjunction();
            if (from == null) return cb.lessThanOrEqualTo(root.get("amount"), to);
            if (to == null) return cb.greaterThanOrEqualTo(root.get("amount"), from);
            return cb.between(root.get("amount"), from, to);
        };
    }

    public static Specification<Transaction> withCustomerNameLike(String name) {
        return (root, query, cb) ->
                !StringUtils.hasText(name) ? cb.conjunction() :
                        cb.like(cb.lower(root.get("customer").get("name")), "%" + name.toLowerCase() + "%");
    }

    public static Specification<Transaction> withStationNameLike(String name) {
        return (root, query, cb) ->
                !StringUtils.hasText(name) ? cb.conjunction() :
                        cb.like(cb.lower(root.get("chargingSession").get("chargingConnector").get("pole").get("station").get("name")),
                                "%" + name.toLowerCase() + "%");
    }

    public static Specification<Transaction> withBankNameLike(String bankName) {
        return (root, query, cb) ->
                !StringUtils.hasText(bankName) ? cb.conjunction() :
                        cb.like(cb.lower(root.get("bankName")), "%" + bankName.toLowerCase() + "%");
    }
}
