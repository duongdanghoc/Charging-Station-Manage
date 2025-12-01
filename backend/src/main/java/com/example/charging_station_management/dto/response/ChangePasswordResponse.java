package com.example.charging_station_management.dto.response;

import java.time.LocalDateTime;

public record ChangePasswordResponse(
        String message,
        String email,
        LocalDateTime changedAt
) {
}
