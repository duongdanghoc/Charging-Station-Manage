package com.example.charging_station_management.service.impl;

import com.example.charging_station_management.dto.request.CreateStationRequest;
import com.example.charging_station_management.dto.request.UpdateStationRequest;
import com.example.charging_station_management.dto.response.StationResponse;
import com.example.charging_station_management.entity.converters.Location;
import com.example.charging_station_management.entity.converters.Station;
import com.example.charging_station_management.entity.converters.User;
import com.example.charging_station_management.entity.converters.Vendor;
import com.example.charging_station_management.exception.ResourceNotFoundException;
import com.example.charging_station_management.repository.LocationRepository;
import com.example.charging_station_management.repository.StationRepository;
import com.example.charging_station_management.service.StationService;
import com.example.charging_station_management.utils.helper.UserHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.charging_station_management.dto.mapper.StationMapper;

@Service
@RequiredArgsConstructor
public class StationServiceImpl implements StationService {

    private final StationRepository stationRepository;
    private final LocationRepository locationRepository;
    private final UserHelper userHelper;
    private final StationMapper stationMapper;

    // Helper method để lấy Vendor hiện tại từ SecurityContext
    private Vendor getCurrentVendor() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication.getName();
        User user = userHelper.findUserByEmail(email);

        if (user instanceof Vendor vendor) {
            return vendor;
        }
        throw new IllegalArgumentException("Người dùng hiện tại không phải là Vendor");
    }

    @Override
    @Transactional
    public StationResponse createStation(CreateStationRequest request) {
        Vendor vendor = getCurrentVendor();

        // 1. Tạo và LƯU Location trước
        Location location = new Location();
        location.setLatitude(request.getLatitude());
        location.setLongitude(request.getLongitude());
        location.setProvince(request.getProvince());
        location.setAddressDetail(request.getAddressDetail());

        Location savedLocation = locationRepository.save(location);

        // 2. Tạo Station và gán Location đã lưu
        Station station = new Station();
        station.setName(request.getName());
        station.setOpenTime(request.getOpenTime());
        station.setCloseTime(request.getCloseTime());
        station.setType(request.getType());
        station.setStatus(1); // Mặc định Active
        station.setVendor(vendor);
        station.setLocation(savedLocation);

        Station savedStation = stationRepository.save(station);
        return stationMapper.toResponse(savedStation);
    }

    @Override
    @Transactional
    public StationResponse updateStation(Integer stationId, UpdateStationRequest request) {
        Vendor vendor = getCurrentVendor();
        Station station = stationRepository.findByIdAndVendorId(stationId, vendor.getId())
                .orElseThrow(
                        () -> new ResourceNotFoundException("Không tìm thấy trạm hoặc bạn không có quyền chỉnh sửa"));

        if (request.getName() != null)
            station.setName(request.getName());
        if (request.getOpenTime() != null)
            station.setOpenTime(request.getOpenTime());
        if (request.getCloseTime() != null)
            station.setCloseTime(request.getCloseTime());
        if (request.getType() != null)
            station.setType(request.getType());
        if (request.getStatus() != null)
            station.setStatus(request.getStatus());

        // Update Location
        Location location = station.getLocation();
        boolean locationChanged = false;

        if (request.getLatitude() != null) {
            location.setLatitude(request.getLatitude());
            locationChanged = true;
        }
        if (request.getLongitude() != null) {
            location.setLongitude(request.getLongitude());
            locationChanged = true;
        }
        if (request.getProvince() != null) {
            location.setProvince(request.getProvince());
            locationChanged = true;
        }
        if (request.getAddressDetail() != null) {
            location.setAddressDetail(request.getAddressDetail());
            locationChanged = true;
        }

        if (locationChanged) {
            locationRepository.save(location);
        }

        Station updatedStation = stationRepository.save(station);
        return stationMapper.toResponse(updatedStation);
    }

    @Override
    @Transactional
    public void deleteStation(Integer stationId) {
        Vendor vendor = getCurrentVendor();
        Station station = stationRepository.findByIdAndVendorId(stationId, vendor.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trạm hoặc bạn không có quyền xóa"));

        // Thực hiện xóa mềm (chuyển status về INACTIVE = 0) hoặc xóa cứng tùy nghiệp vụ
        // Ở đây tạm thời dùng xóa cứng của JPA
        stationRepository.delete(station);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<StationResponse> getMyStations(Pageable pageable) {
        Vendor vendor = getCurrentVendor();
        Page<Station> stations = stationRepository.findByVendorId(vendor.getId(), pageable);
        return stations.map(stationMapper::toResponse);
    }
}
