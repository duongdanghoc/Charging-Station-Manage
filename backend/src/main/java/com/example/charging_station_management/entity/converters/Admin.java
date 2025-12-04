package com.example.charging_station_management.entity.converters;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "admins") // Tên bảng riêng cho Admin trong Database
@DiscriminatorValue("ADMIN") // Giá trị này sẽ được lưu vào cột 'user_type' trong bảng 'users'
@Data
@SuperBuilder
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Admin extends User {

    // Tại đây bạn có thể thêm các thuộc tính riêng chỉ Admin mới có.
    // Ví dụ: mã nhân viên, phòng ban, cấp độ quản trị...
    // Hiện tại nếu chưa có gì đặc biệt thì có thể để trống,
    // nó sẽ vẫn hoạt động nhờ các trường kế thừa từ User (id, email, password...).

    // Ví dụ:
    // @Column(name = "admin_level")
    // private String adminLevel;
}
