package com.example.charging_station_management.service;

import com.example.charging_station_management.dto.request.RegisterRequest;
import com.example.charging_station_management.dto.response.RegisterResponse;

public interface AuthService {
    RegisterResponse register(RegisterRequest request);

}
