package com.example.charging_station_management.dto.response;

import com.example.charging_station_management.entity.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserInfoResponse {
    private Integer id;
    private String email;
    private String name;
    private String phone;
    private Role role;
}