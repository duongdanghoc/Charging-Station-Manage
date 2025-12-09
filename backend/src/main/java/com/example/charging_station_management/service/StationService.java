package com.example.charging_station_management.service;

import com.example.charging_station_management.dto.request.CreateStationRequest;
import com.example.charging_station_management.dto.request.UpdateStationRequest;
import com.example.charging_station_management.dto.response.StationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;
public interface StationService {
    // Các method dành cho Vendor
    StationResponse createStation(CreateStationRequest request);

    StationResponse updateStation(Integer stationId, UpdateStationRequest request);

    void deleteStation(Integer stationId);

    Page<StationResponse> getMyStations(Pageable pageable);


// --- ADMIN METHODS ---

    // 1. Lấy tất cả trạm (dùng cho Admin Dashboard)
    Page<StationResponse> getAllStations(Pageable pageable);

    // 2. Lấy chi tiết trạm (theo ID, không cần check Vendor)
    StationResponse getStationById(Integer stationId);

    // 3. Cập nhật trạng thái (Duyệt/Khóa trạm)
    void updateStationStatus(Integer stationId, Integer newStatus);

    // 4. Xóa trạm (Quyền Admin)
    void adminDeleteStation(Integer stationId);

}
