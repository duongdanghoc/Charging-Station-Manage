package com.example.charging_station_management.service;

import com.example.charging_station_management.dto.request.UpdateProfileRequest;
import com.example.charging_station_management.dto.response.StationResponse;
import com.example.charging_station_management.dto.response.ReviewResponse;
import com.example.charging_station_management.dto.response.UpdateProfileResponse;
import com.example.charging_station_management.dto.response.UserInfoResponse;
import com.example.charging_station_management.entity.converters.Station;
import com.example.charging_station_management.entity.converters.User;
import com.example.charging_station_management.entity.enums.Role;
import com.example.charging_station_management.entity.enums.TargetType;
import com.example.charging_station_management.repository.RatingRepository;
import com.example.charging_station_management.repository.StationRepository;
import com.example.charging_station_management.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerService {

    private final UserRepository userRepository;
    private final StationRepository stationRepository;
    private final RatingRepository ratingRepository;

    @Transactional(readOnly = true)
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
                "Cập nhật thông tin thành công"
        );
    }

    @Transactional(readOnly = true)
    public Page<StationResponse> getAllStations(Pageable pageable) {
        return stationRepository.findAll(pageable)
                .map(this::convertToStationResponse);
    }

    @Transactional(readOnly = true)
    public Page<StationResponse> searchStations(String query, Pageable pageable) {
        return stationRepository.searchStations(query, pageable)
                .map(this::convertToStationResponse);
    }

    @Transactional(readOnly = true)
    public StationResponse getStationById(Integer id) {
        Station station = stationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Station not found: " + id));
        return convertToStationResponse(station);
    }

    @Transactional(readOnly = true)
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

    private StationResponse convertToStationResponse(Station station) {
        return StationResponse.builder()
                .id(station.getId())
                .name(station.getName())
                .address(station.getLocation().getAddressDetail())
                .city(station.getLocation().getProvince())
                .latitude(station.getLocation().getLatitude().doubleValue())
                .longitude(station.getLocation().getLongitude().doubleValue())
                .openTime(station.getOpenTime())
                .closeTime(station.getCloseTime())
                .status(station.getStatus())
                .type(station.getType())
                .vendorName(station.getVendor().getName())
                .averageRating(0.0) 
                .totalRatings(0)
                .build();
    }
}