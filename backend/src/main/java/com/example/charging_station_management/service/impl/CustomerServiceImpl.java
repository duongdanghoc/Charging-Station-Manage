package com.example.charging_station_management.service.impl;

import com.example.charging_station_management.dto.mapper.ChargingSessionMapper;
import com.example.charging_station_management.dto.mapper.StationMapper;
import com.example.charging_station_management.dto.request.UpdateProfileRequest;
import com.example.charging_station_management.dto.response.StationResponse;
import com.example.charging_station_management.dto.response.ChargingHistoryResponse;
import com.example.charging_station_management.dto.response.ReviewResponse;
import com.example.charging_station_management.dto.response.UpdateProfileResponse;
import com.example.charging_station_management.dto.response.UserInfoResponse;
import com.example.charging_station_management.entity.converters.Station;
import com.example.charging_station_management.entity.converters.User;
import com.example.charging_station_management.entity.enums.Role;
import com.example.charging_station_management.entity.enums.TargetType;
import com.example.charging_station_management.repository.ChargingSessionRepository;
import com.example.charging_station_management.repository.RatingRepository;
import com.example.charging_station_management.repository.StationRepository;
import com.example.charging_station_management.repository.UserRepository;
import com.example.charging_station_management.service.CustomerService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CustomerServiceImpl implements CustomerService {

    private final UserRepository userRepository;
    private final StationRepository stationRepository;
    private final RatingRepository ratingRepository;
    private final ChargingSessionRepository chargingSessionRepository;

    private final StationMapper stationMapper;
    private final ChargingSessionMapper chargingSessionMapper;

    public UserInfoResponse getProfile(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));

        return new UserInfoResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getPhone(),
                Role.CUSTOMER);
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
                savedUser.getPhone(),
                "Cập nhật thông tin thành công");
    }

    public Page<StationResponse> searchStations(String query, Pageable pageable) {
        return stationRepository.searchStations(query, pageable)
                .map(stationMapper::toResponse);
    }

    public StationResponse getStationById(Integer id) {
        Station station = stationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Station not found: " + id));
        return stationMapper.toResponse(station);
    }

    public Page<ReviewResponse> getStationReviews(Integer stationId, Pageable pageable) {
        if (!stationRepository.existsById(stationId)) {
            throw new RuntimeException("Station not found: " + stationId);
        }

        return ratingRepository.findByTargetTypeAndTargetId(TargetType.STATION, stationId, pageable)
                .map(rating -> ReviewResponse.builder()
                        .id(rating.getId())
                        .customerName(rating.getCustomer().getName())
                        .stars(rating.getStars())
                        .comment(rating.getComment())
                        .createdAt(rating.getCreatedAt())
                        .build());
    }

    public Page<StationResponse> getAllStations(Pageable pageable) {
        return stationRepository.findAll(pageable)
                .map(stationMapper::toResponse);
    }

    public Page<ChargingHistoryResponse> getChargingHistory(Integer userId, Pageable pageable) {
        if (!userRepository.existsById(userId)) {
            throw new RuntimeException("User not found: " + userId);
        }
        
        return chargingSessionRepository.findByElectricVehicle_Customer_IdOrderByStartTimeDesc(userId, pageable)
                .map(chargingSessionMapper::toHistoryResponse);
    }
}
