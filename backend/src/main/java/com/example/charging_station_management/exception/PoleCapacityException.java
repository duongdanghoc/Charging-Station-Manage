package com.example.charging_station_management.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// Khuyến nghị sử dụng @ResponseStatus để trả về HTTP 400 Bad Request
@ResponseStatus(HttpStatus.BAD_REQUEST) 
public class PoleCapacityException extends RuntimeException {

    public PoleCapacityException(String message) {
        super(message);
    }

    public PoleCapacityException(String message, Throwable cause) {
        super(message, cause);
    }
}