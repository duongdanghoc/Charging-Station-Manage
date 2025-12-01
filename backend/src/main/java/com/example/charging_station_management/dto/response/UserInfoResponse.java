package com.example.charging_station_management.dto.response;

import com.example.charging_station_management.entity.enums.Role;

public record UserInfoResponse(
        Integer id,
        String email,
        String name,
        String phone,
        Role role
) {}