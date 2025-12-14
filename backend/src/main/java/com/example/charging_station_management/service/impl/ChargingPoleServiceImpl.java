package com.example.charging_station_management.service.impl;

import com.example.charging_station_management.dto.mapper.StationMapper;
import com.example.charging_station_management.dto.request.CreateChargingPoleRequest;
import com.example.charging_station_management.dto.request.UpdateChargingPoleRequest;
import com.example.charging_station_management.dto.response.ChargingPoleResponse;
import com.example.charging_station_management.entity.converters.ChargingPole;
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
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChargingPoleServiceImpl implements ChargingPoleService {
    
    private final ChargingPoleRepository chargingPoleRepository;
    private final StationRepository stationRepository;
    private final UserHelper userHelper;
    private final StationMapper stationMapper; 

    @Override
    public List<ChargingPoleResponse> getAllPolesByStationId(Integer stationId) {
        List<ChargingPole> poles = chargingPoleRepository.findByStationId(stationId);
        return stationMapper.toPoleResponseList(poles);
    }

    @Override
    @Transactional
    public ChargingPoleResponse createChargingPole(CreateChargingPoleRequest request) {
        Vendor currentVendor = userHelper.getVendorLogin();

        Station station = stationRepository.findById(request.getStationId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trạm sạc với ID: " + request.getStationId()));

        if (station.getVendor().getId() != currentVendor.getId()) {
            throw new AccessDeniedException("Bạn không có quyền thêm trụ vào trạm sạc này");
        }

        ChargingPole pole = new ChargingPole();
        pole.setStation(station);
        pole.setManufacturer(request.getManufacturer());
        pole.setMaxPower(BigDecimal.valueOf(request.getMaxPower())); 
        pole.setInstallDate(request.getInstallDate() != null ? request.getInstallDate() : LocalDate.now());
        pole.setConnectorCount(0);

        ChargingPole savedPole = chargingPoleRepository.save(pole);
        return stationMapper.toPoleResponse(savedPole);
    }

    @Override
    @Transactional
    public void deleteChargingPole(Integer id) {
        Vendor currentVendor = userHelper.getVendorLogin();

        ChargingPole pole = chargingPoleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trụ sạc"));

        if (pole.getStation().getVendor().getId() != currentVendor.getId()) {
            throw new AccessDeniedException("Bạn không có quyền xóa trụ sạc này");
        }

        // --- [QUAN TRỌNG] FIX LỖI XÓA KHÔNG THÀNH CÔNG ---
        // Nguyên nhân: Do Station load danh sách poles dạng EAGER, object Station trong bộ nhớ
        // vẫn giữ tham chiếu đến pole cần xóa. Khi commit, JPA có thể vô tình "cứu" lại pole đó.
        Station station = pole.getStation();
        if (station != null && station.getChargingPoles() != null) {
            // Xóa pole khỏi list của station để đồng bộ trạng thái trong bộ nhớ
            // Dùng removeIf so sánh theo ID để an toàn hơn so với equals()
            station.getChargingPoles().removeIf(p -> p.getId().equals(id));
        }
        // -------------------------------------------------

        chargingPoleRepository.delete(pole);
    }

    @Override
    @Transactional
    public ChargingPoleResponse updateChargingPole(Integer id, UpdateChargingPoleRequest request) {
        Vendor currentVendor = userHelper.getVendorLogin();

        ChargingPole pole = chargingPoleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy trụ sạc"));

        if (pole.getStation().getVendor().getId() != currentVendor.getId()) {
            throw new AccessDeniedException("Bạn không có quyền sửa trụ sạc này");
        }

        if (request.getManufacturer() != null) {
            pole.setManufacturer(request.getManufacturer());
        }
        if (request.getMaxPower() != null) {
            pole.setMaxPower(request.getMaxPower());
        }
        if (request.getInstallDate() != null) {
            pole.setInstallDate(request.getInstallDate());
        }
        
        return stationMapper.toPoleResponse(chargingPoleRepository.save(pole));
    }
}