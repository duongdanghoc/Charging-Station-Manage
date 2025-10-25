package com.example.charging_station_management.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_EMPTY) 
public class ErrorResponse {

    private LocalDateTime timestamp;
    private int status;
    private String error; // Ví dụ: "Not Found", "Bad Request"
    private String message; // Thông điệp lỗi chi tiết 
    private String path; // URI của request gây ra lỗi
    private Map<String, String> details; // Dành riêng cho các lỗi validation

    // Constructor cho các lỗi thông thường
    public ErrorResponse(LocalDateTime timestamp, int status, String error, String message, String path) {
        this.timestamp = timestamp;
        this.status = status;
        this.error = error;
        this.message = message;
        this.path = path;
    }

    // Constructor cho các lỗi validation
    public ErrorResponse(LocalDateTime timestamp, int status, String error, String message, String path, Map<String, String> details) {
        this(timestamp, status, error, message, path);
        this.details = details;
    }
}
