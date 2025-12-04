package com.example.charging_station_management.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.HttpStatus; // Nhớ import thư viện này

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

    // 👇👇👇 THÊM CÁC HÀM NÀY ĐỂ HẾT LỖI 👇👇👇

    // 1. Hàm thành công trả về dữ liệu (Dùng cho getDashboardStats)
    public static <T> BaseApiResponse<T> success(T data) {
        return new BaseApiResponse<>(HttpStatus.OK.value(), data, "Success");
    }

    // 2. Hàm thành công chỉ trả về thông báo (Dùng cho deleteUser)
    public static <T> BaseApiResponse<T> success(String message) {
        return new BaseApiResponse<>(HttpStatus.OK.value(), null, message);
    }

    // 3. Hàm thành công trả về cả dữ liệu và thông báo tùy chỉnh
    public static <T> BaseApiResponse<T> success(T data, String message) {
        return new BaseApiResponse<>(HttpStatus.OK.value(), data, message);
    }

    // 4. Hàm báo lỗi chung
    public static <T> BaseApiResponse<T> error(String message) {
        return new BaseApiResponse<>(HttpStatus.BAD_REQUEST.value(), null, message);
    }

    // 5. Hàm báo lỗi với mã lỗi cụ thể
    public static <T> BaseApiResponse<T> error(int code, String message) {
        return new BaseApiResponse<>(code, null, message);
    }
}
