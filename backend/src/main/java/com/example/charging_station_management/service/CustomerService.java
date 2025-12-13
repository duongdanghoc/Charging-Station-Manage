package com.example.charging_station_management.service;

import com.example.charging_station_management.dto.request.UpdateProfileRequest;
import com.example.charging_station_management.dto.response.*;
import com.example.charging_station_management.entity.enums.ConnectorType;
import com.example.charging_station_management.entity.enums.VehicleType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CustomerService {
    UserInfoResponse getProfile(Integer userId);
    
    UpdateProfileResponse updateProfile(Integer userId, UpdateProfileRequest request);
    
    Page<StationResponse> searchStations(String query, Pageable pageable);
    
    StationResponse getStationById(Integer id);
    
    Page<StationResponse> getAllStations(Pageable pageable);
    
    Page<StationResponse> filterStations(String search, Integer status, VehicleType vehicleType, ConnectorType connectorType, Pageable pageable);
    
    Page<ReviewResponse> getStationReviews(Integer stationId, Pageable pageable);

    Page<ChargingHistoryResponse> getChargingHistory(Integer userId, Pageable pageable);

    Page<TransactionHistoryResponse> getTransactionHistory(Integer userId, Pageable pageable);
}
