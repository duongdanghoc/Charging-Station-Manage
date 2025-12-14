package com.example.charging_station_management.service;

import com.example.charging_station_management.dto.request.CreateChargingPoleRequest;
import com.example.charging_station_management.dto.request.UpdateChargingPoleRequest;
import com.example.charging_station_management.dto.response.ChargingPoleResponse;

public interface ChargingPoleService {
    // Hàm tạo trụ mới
    ChargingPoleResponse createChargingPole(CreateChargingPoleRequest request);
    ChargingPoleResponse updateChargingPole(Integer id, UpdateChargingPoleRequest request);
    // Hàm xóa trụ
    void deleteChargingPole(Integer id);
}