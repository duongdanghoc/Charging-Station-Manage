package com.example.charging_station_management.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@JsonInclude(JsonInclude.Include.NON_NULL) 
@Data
@AllArgsConstructor
@NoArgsConstructor
public class BaseApiResponse<T> {
    private int code;
    private T data;
    private String message;

    public BaseApiResponse(int code, String message) {
        this.code = code;
        this.message = message;
    }
}
