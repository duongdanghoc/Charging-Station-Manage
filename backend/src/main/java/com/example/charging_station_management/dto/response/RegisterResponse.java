package com.example.charging_station_management.dto.response;

import com.example.charging_station_management.entity.enums.Role;

public record RegisterResponse(
        Integer id,
        String name,
        String email,
        String phone,
        Role role,
        String message
) {}
