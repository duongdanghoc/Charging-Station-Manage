package com.example.charging_station_management.service.impl;

import com.example.charging_station_management.dto.request.CreateChargingPoleRequest;
import com.example.charging_station_management.dto.request.UpdateChargingPoleRequest;
import com.example.charging_station_management.dto.response.ChargingPoleResponse;
import com.example.charging_station_management.entity.converters.ChargingPole; // Lưu ý import đúng package entity của bạn
import com.example.charging_station_management.entity.converters.Station;
import com.example.charging_station_management.entity.converters.Vendor;
import com.example.charging_station_management.exception.ResourceNotFoundException;
import com.example.charging_station_management.repository.ChargingPoleRepository;
import com.example.charging_station_management.repository.StationRepository;
import com.example.charging_station_management.service.ChargingPoleService;
import com.example.charging_station_management.utils.helper.UserHelper; 
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class ChargingPoleServiceImpl implements ChargingPoleService {
    private static final int MAX_CONNECTORS_LIMIT = 2;
    private final ChargingPoleRepository chargingPoleRepository;
    private final StationRepository stationRepository;
    private final UserHelper userHelper;

    @Override
    @Transactional
    public ChargingPoleResponse createChargingPole(CreateChargingPoleRequest request) {
        // 1. Lấy Vendor
        Vendor currentVendor = userHelper.getVendorLogin();

        // 2. Tìm Station
        Station station = stationRepository.findById(request.getStationId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trạm sạc với ID: " + request.getStationId()));

        // 3. Check quyền (Dùng != cho int primitive hoặc !equals cho Integer object)
        if (station.getVendor().getId() != currentVendor.getId()) {
            throw new AccessDeniedException("Bạn không có quyền thêm trụ vào trạm sạc này");
        }

        // 4. Tạo Entity
        ChargingPole pole = new ChargingPole();
        pole.setStation(station);
        pole.setManufacturer(request.getManufacturer());
        // Chuyển Double sang BigDecimal
        pole.setMaxPower(BigDecimal.valueOf(request.getMaxPower()));
        pole.setInstallDate(request.getInstallDate() != null ? request.getInstallDate() : LocalDate.now());
        pole.setConnectorCount(0);

        // 5. Lưu
        ChargingPole savedPole = chargingPoleRepository.save(pole);

        // 6. Map response
        return mapToResponse(savedPole);
    }

    @Override
    @Transactional
    public void deleteChargingPole(Integer id) {
        Vendor currentVendor = userHelper.getVendorLogin();

        ChargingPole pole = chargingPoleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trụ sạc"));

        // 👇 ĐÃ SỬA: Lấy station từ pole ra để check quyền
        if (pole.getStation().getVendor().getId() != currentVendor.getId()) {
            throw new AccessDeniedException("Bạn không có quyền xóa trụ sạc này");
        }

        chargingPoleRepository.delete(pole);
    }
    
    @Override
    @Transactional
    public ChargingPoleResponse updateChargingPole(Integer id, UpdateChargingPoleRequest request) {
        Vendor currentVendor = userHelper.getVendorLogin();

        ChargingPole pole = chargingPoleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trụ sạc"));

        // Check quyền sở hữu
        if (pole.getStation().getVendor().getId() != currentVendor.getId()) {
            throw new AccessDeniedException("Bạn không có quyền sửa trụ sạc này");
        }

        // Cập nhật thông tin
        if (request.getManufacturer() != null) {
            pole.setManufacturer(request.getManufacturer());
        }
        if (request.getMaxPower() != null) {
            pole.setMaxPower(request.getMaxPower());
        }
        if (request.getInstallDate() != null) {
            pole.setInstallDate(request.getInstallDate());
        }

        return mapToResponse(chargingPoleRepository.save(pole));
    }

    private ChargingPoleResponse mapToResponse(ChargingPole pole) {
        ChargingPoleResponse response = new ChargingPoleResponse();
        response.setId(pole.getId());
        
        // 👇 ĐÃ SỬA: Đảm bảo DTO đã có trường stationId
        response.setStationId(pole.getStation().getId());
        
        response.setManufacturer(pole.getManufacturer());
        response.setMaxPower(pole.getMaxPower());
        response.setInstallDate(pole.getInstallDate());
        response.setConnectorCount(pole.getConnectorCount());
        return response;
    }
}