package com.example.charging_station_management.repository;

import com.example.charging_station_management.entity.converters.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Integer> {
    // Sau này nếu cần tìm admin theo mã nhân viên hay tiêu chí riêng thì viết thêm hàm vào đây
}
