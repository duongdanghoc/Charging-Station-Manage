package com.example.charging_station_management.dto.request;

import lombok.Data;

@Data
public class UpdateStatusRequest {
    // Frontend gửi: { "status": "ACTIVE" }
    private String status;
}
