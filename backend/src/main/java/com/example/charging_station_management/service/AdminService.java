package com.example.charging_station_management.service;

import com.example.charging_station_management.dto.UserDto;
import com.example.charging_station_management.dto.request.RegisterRequest;
import com.example.charging_station_management.dto.request.UserFilterRequest;
import com.example.charging_station_management.dto.response.RegisterResponse;

import org.springframework.data.domain.Page;

public interface AdminService {

  /**
   * Lấy danh sách người dùng có phân trang, lọc và tìm kiếm.
   */
  Page<UserDto> getUsers(UserFilterRequest request);

  /**
   * Xóa người dùng theo ID.
   */
  void deleteUser(int userId);
  RegisterResponse createUser(RegisterRequest request);
}
