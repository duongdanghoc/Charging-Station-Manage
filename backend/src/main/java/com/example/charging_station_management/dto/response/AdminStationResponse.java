package com.example.charging_station_management.dto.response;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class AdminStationResponse {
    private Long id;
    private String name;
    private String address;
    private Integer ports;

    // 👇 Frontend cần String ("ACTIVE"), nên DTO để String
    private String status;

    private BigDecimal revenue;
    private String lastCheck; // Trả về dạng chuỗi "yyyy-MM-dd"
}
