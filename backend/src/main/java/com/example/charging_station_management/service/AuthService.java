package com.example.charging_station_management.service;

import com.example.charging_station_management.dto.request.LoginRequest;
import com.example.charging_station_management.dto.request.RegisterRequest;
import com.example.charging_station_management.dto.response.JwtResponse;
import com.example.charging_station_management.dto.response.RegisterResponse;

public interface AuthService {
    RegisterResponse register(RegisterRequest request);
    JwtResponse authenticateUser(LoginRequest loginRequest);
}
