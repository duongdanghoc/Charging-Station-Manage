package com.example.charging_station_management.repository.specification;

import com.example.charging_station_management.entity.converters.ChargingSession;
import com.example.charging_station_management.entity.enums.SessionStatus;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

public class ChargingSessionSpecification {

    public static Specification<ChargingSession> withCustomerId(Integer customerId) {
        return (root, query, cb) ->
                customerId == null ? cb.conjunction() :
                        cb.equal(root.get("electricVehicle").get("customer").get("id"), customerId);
    }

    public static Specification<ChargingSession> withStationId(Integer stationId) {
        return (root, query, cb) ->
                stationId == null ? cb.conjunction() :
                        cb.equal(root.get("chargingConnector").get("pole").get("station").get("id"), stationId);
    }

    public static Specification<ChargingSession> withStatus(SessionStatus status) {
        return (root, query, cb) ->
                status == null ? cb.conjunction() : cb.equal(root.get("status"), status);
    }

    public static Specification<ChargingSession> withStartTimeBetween(LocalDateTime from, LocalDateTime to) {
        return (root, query, cb) -> {
            if (from == null && to == null) return cb.conjunction();
            if (from == null) return cb.lessThanOrEqualTo(root.get("startTime"), to);
            if (to == null) return cb.greaterThanOrEqualTo(root.get("startTime"), from);
            return cb.between(root.get("startTime"), from, to);
        };
    }

    public static Specification<ChargingSession> withEndTimeBetween(LocalDateTime from, LocalDateTime to) {
        return (root, query, cb) -> {
            if (from == null && to == null) return cb.conjunction();
            if (from == null) return cb.lessThanOrEqualTo(root.get("endTime"), to);
            if (to == null) return cb.greaterThanOrEqualTo(root.get("endTime"), from);
            return cb.between(root.get("endTime"), from, to);
        };
    }

    public static Specification<ChargingSession> withCustomerNameLike(String name) {
        return (root, query, cb) ->
                !StringUtils.hasText(name) ? cb.conjunction() :
                        cb.like(cb.lower(root.get("electricVehicle").get("customer").get("name")),
                                "%" + name.toLowerCase() + "%");
    }

    public static Specification<ChargingSession> withStationNameLike(String name) {
        return (root, query, cb) ->
                !StringUtils.hasText(name) ? cb.conjunction() :
                        cb.like(cb.lower(root.get("chargingConnector").get("pole").get("station").get("name")),
                                "%" + name.toLowerCase() + "%");
    }

    public static Specification<ChargingSession> withLicensePlateLike(String licensePlate) {
        return (root, query, cb) ->
                !StringUtils.hasText(licensePlate) ? cb.conjunction() :
                        cb.like(cb.lower(root.get("electricVehicle").get("licensePlate")),
                                "%" + licensePlate.toLowerCase() + "%");
    }
}
