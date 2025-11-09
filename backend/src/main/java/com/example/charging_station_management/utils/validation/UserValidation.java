package com.example.charging_station_management.utils.validation;

import com.example.charging_station_management.dto.request.LoginRequest;
import com.example.charging_station_management.entity.converters.User;
import com.example.charging_station_management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class UserValidation {
    private final UserRepository userRepository;

    public void validateEmailNotExists(String email) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email đã được đăng ký");
        }
    }

    public void validateLoginCredentials(LoginRequest loginRequest) {
        if (loginRequest == null) {
            throw new IllegalArgumentException("Thông tin đăng nhập không được để trống");
        }
    }

    public void validateUserAccountActive(User user) {
        if (user.getStatus() == 0) {
            throw new IllegalArgumentException("Tài khoản không còn hoạt động");
        }
    }
}
