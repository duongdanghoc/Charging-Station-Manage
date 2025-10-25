package com.example.charging_station_management.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ResourceNotFoundException extends RuntimeException {
    private String message;
    private Object[] args; 
}
