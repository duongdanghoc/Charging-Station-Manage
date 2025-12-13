package com.example.charging_station_management.entity.enums;
import lombok.Getter;

@Getter
public enum StationStatus {
    INACTIVE(0),
    ACTIVE(1),
    MAINTENANCE(2);
    DELETED(-1);
  
    private final int value;

    StationStatus(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }

    // Tìm Enum từ số (Dùng khi lấy từ DB lên)
    public static StationStatus fromInt(Integer value) {
        if (value == null) return INACTIVE;
        for (StationStatus s : values()) {
            if (s.value == value) return s;
        }
        return INACTIVE;
    }

    // Tìm Enum từ chuỗi (Dùng khi FE gửi xuống)
    public static StationStatus fromString(String str) {
        try {
            return valueOf(str.toUpperCase());
        } catch (Exception e) {
            return INACTIVE;
        }
    public static StationStatus fromValue(int value) {
        for (StationStatus status : StationStatus.values()) {
            if (status.value == value)
                return status;
        }
        throw new IllegalArgumentException("Unknown status value: " + value);
    }
}
