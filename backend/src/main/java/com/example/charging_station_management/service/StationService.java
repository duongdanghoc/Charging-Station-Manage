package com.example.charging_station_management.service;

import com.example.charging_station_management.dto.request.CreateStationRequest;
import com.example.charging_station_management.dto.request.UpdateStationRequest;
import com.example.charging_station_management.dto.response.StationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface StationService {
    // Các method dành cho Vendor
    StationResponse createStation(CreateStationRequest request);

    StationResponse updateStation(Integer stationId, UpdateStationRequest request);

    void deleteStation(Integer stationId);

    Page<StationResponse> getMyStations(Pageable pageable);
}
