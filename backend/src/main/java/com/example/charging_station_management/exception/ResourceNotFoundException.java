package com.example.charging_station_management.exception;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor // Constructor 2 tham số: (String message, Object[] args)
public class ResourceNotFoundException extends RuntimeException {
    private String message;
    private Object[] args;

    // 👇👇👇 THÊM HÀM KHỞI TẠO NÀY 👇👇👇
    /**
     * Constructor cho trường hợp chỉ truyền message, không có args.
     */
    public ResourceNotFoundException(String message) {
        this(message, null);
    }
}
