package com.example.charging_station_management.service;

import com.example.charging_station_management.dto.request.UpdateProfileRequest;
import com.example.charging_station_management.dto.response.UpdateProfileResponse;
import com.example.charging_station_management.dto.response.UserInfoResponse;
import com.example.charging_station_management.entity.converters.User;
import com.example.charging_station_management.entity.enums.Role;
import com.example.charging_station_management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserInfoResponse getProfile(Integer userId) {
        UserInfoResponse userInfoResponse = new UserInfoResponse();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        userInfoResponse.setId(user.getId());
        userInfoResponse.setName(user.getName());
        userInfoResponse.setRole(Role.CUSTOMER);
        userInfoResponse.setEmail(user.getEmail());
        userInfoResponse.setPhone(user.getPhone());
        return userInfoResponse;
    }

    @Transactional
    public UpdateProfileResponse updateProfile(Integer userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        user.setName(request.getName());
        user.setPhone(request.getPhone());

        User savedUser = userRepository.save(user);
        log.info("Profile updated for user: {}", userId);

        return new UpdateProfileResponse(
                savedUser.getName(),
                savedUser.getPhone());
    }
}