package com.example.charging_station_management.entity.enums;

import lombok.Getter;

@Getter
public enum StationStatus {
    ACTIVE(1),
    INACTIVE(0),
    DELETED(-1);

    private final int value;

    StationStatus(int value) {
        this.value = value;
    }

    public static StationStatus fromValue(int value) {
        for (StationStatus status : StationStatus.values()) {
            if (status.value == value)
                return status;
        }
        throw new IllegalArgumentException("Unknown status value: " + value);
    }
}
