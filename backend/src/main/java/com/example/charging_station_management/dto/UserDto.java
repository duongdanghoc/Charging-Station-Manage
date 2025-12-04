package com.example.charging_station_management.dto;

import com.example.charging_station_management.entity.enums.Role;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserDto {
  private int id;
  private String name;
  private String email;
  private String phone;
  private Role role; // <-- Trường role rõ ràng
  private Integer status;
}
