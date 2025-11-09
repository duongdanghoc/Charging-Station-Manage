package com.example.charging_station_management.dto.response;

import com.example.charging_station_management.entity.enums.Role;
import lombok.Data;

@Data
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private String email;
    private String name;
    private Role role;

    public JwtResponse(String accessToken, String email, String name, Role role) {
        this.token = accessToken;
        this.email = email;
        this.name = name;
        this.role = role;
    }
}
