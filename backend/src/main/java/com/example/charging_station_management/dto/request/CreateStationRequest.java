package com.example.charging_station_management.dto.request;

import com.example.charging_station_management.entity.enums.VehicleType;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateStationRequest {

    @NotBlank(message = "Tên trạm không được để trống")
    @Size(min = 5, max = 200, message = "Tên trạm phải từ 5 đến 200 ký tự")
    private String name;

    @NotNull(message = "Giờ mở cửa không được để trống")
    private LocalTime openTime;

    @NotNull(message = "Giờ đóng cửa không được để trống")
    private LocalTime closeTime;

    @NotNull(message = "Loại xe phục vụ không được để trống")
    private VehicleType type;

    // --- Location Info ---

    @NotNull(message = "Vĩ độ (Latitude) không được để trống")
    @DecimalMin(value = "-90.0", message = "Vĩ độ không hợp lệ")
    @DecimalMax(value = "90.0", message = "Vĩ độ không hợp lệ")
    private BigDecimal latitude;

    @NotNull(message = "Kinh độ (Longitude) không được để trống")
    @DecimalMin(value = "-180.0", message = "Kinh độ không hợp lệ")
    @DecimalMax(value = "180.0", message = "Kinh độ không hợp lệ")
    private BigDecimal longitude;

    @NotBlank(message = "Tỉnh/Thành phố không được để trống")
    private String province;

    @NotBlank(message = "Địa chỉ chi tiết không được để trống")
    private String addressDetail;
}
