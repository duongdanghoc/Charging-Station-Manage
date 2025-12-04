package com.example.charging_station_management.dto.request;

import com.example.charging_station_management.entity.enums.Role;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@Data
@NoArgsConstructor
public class UserFilterRequest {

    // Tham số tìm kiếm
    private String keyword; // Tìm kiếm theo tên hoặc email

    // Tham số lọc
    private Role role; // Lọc theo vai trò (ADMIN, CUSTOMER, VENDOR)
    private Integer status; // Lọc theo trạng thái (0: Inactive, 1: Active)

    // Tham số phân trang
    private int page = 0; // Trang hiện tại (mặc định là 0)
    private int size = 10; // Kích thước trang (mặc định 10)
    private String sortBy = "id"; // Sắp xếp theo trường nào
    private String sortDirection = "asc"; // Chiều sắp xếp

    public Pageable getPageable() {
        Sort sort = Sort.by(Sort.Direction.fromString(sortDirection), sortBy);
        return PageRequest.of(page, size, sort);
    }
}
