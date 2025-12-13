package com.example.charging_station_management.service.impl;

import com.example.charging_station_management.dto.CreateVehicleRequest;
import com.example.charging_station_management.dto.UpdateVehicleRequest;
import com.example.charging_station_management.dto.VehicleDTO;
import com.example.charging_station_management.entity.converters.Customer;
import com.example.charging_station_management.entity.converters.ElectricVehicle;
import com.example.charging_station_management.entity.enums.VehicleType;
import com.example.charging_station_management.repository.CustomerRepository;
import com.example.charging_station_management.repository.ElectricVehicleRepository;
import com.example.charging_station_management.service.VehicleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class VehicleServiceImpl implements VehicleService {
    
    private final ElectricVehicleRepository vehicleRepository;
    private final CustomerRepository customerRepository;
    
    @Override
    @Transactional(readOnly = true)
    public List<VehicleDTO> getCustomerVehicles(Integer customerId) {
        log.info("Getting vehicles for customer ID: {}", customerId);
        try {
            List<ElectricVehicle> vehicles = vehicleRepository.findByCustomerId(customerId);
            log.info("Found {} vehicles for customer {}", vehicles.size(), customerId);
            List<VehicleDTO> result = vehicles.stream()
                    .map(this::convertToDTO)
                    .collect(Collectors.toList());
            log.info("Successfully converted {} vehicles to DTOs", result.size());
            return result;
        } catch (Exception e) {
            log.error("Error getting vehicles for customer {}: {}", customerId, e.getMessage(), e);
            throw e;
        }
    }
    
    @Override
    @Transactional(readOnly = true)
    public VehicleDTO getVehicleById(Integer vehicleId, Integer customerId) {
        ElectricVehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phương tiện"));
        
        if (!Objects.equals(vehicle.getCustomer().getId(), customerId)) {
            throw new RuntimeException("Bạn không có quyền truy cập phương tiện này");
        }
        
        return convertToDTO(vehicle);
    }
    
    @Override
    @Transactional
    public VehicleDTO createVehicle(CreateVehicleRequest request, Integer customerId) {
        // Validate license plate
        if (request.getVehicleType() != VehicleType.BICYCLE) {
            if (request.getLicensePlate() == null || request.getLicensePlate().trim().isEmpty()) {
                throw new RuntimeException("Biển số xe không được để trống");
            }
        }

        // Validate license plate uniqueness
        if (request.getLicensePlate() != null && !request.getLicensePlate().trim().isEmpty()) {
            String normalizedPlate = request.getLicensePlate().replaceAll("[^a-zA-Z0-9]", "");
            if (vehicleRepository.existsByNormalizedLicensePlateAndIdNot(normalizedPlate, null)) {
                throw new RuntimeException("Biển số xe đã tồn tại trong hệ thống");
            }
        }
        
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy khách hàng"));
        
        ElectricVehicle vehicle = new ElectricVehicle();
        vehicle.setCustomer(customer);
        vehicle.setVehicleType(request.getVehicleType());
        vehicle.setBrand(request.getBrand());
        vehicle.setModel(request.getModel());
        vehicle.setLicensePlate(request.getLicensePlate());
        vehicle.setBatteryCapacity(request.getBatteryCapacity());
        vehicle.setConnectorType(request.getConnectorType());
        
        ElectricVehicle savedVehicle = vehicleRepository.save(vehicle);
        return convertToDTO(savedVehicle);
    }
    
    @Override
    @Transactional
    public VehicleDTO updateVehicle(Integer vehicleId, UpdateVehicleRequest request, Integer customerId) {
        ElectricVehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phương tiện"));
        
        if (!Objects.equals(vehicle.getCustomer().getId(), customerId)) {
            throw new RuntimeException("Bạn không có quyền chỉnh sửa phương tiện này");
        }

        // Validate license plate
        if (request.getVehicleType() != VehicleType.BICYCLE) {
            if (request.getLicensePlate() == null || request.getLicensePlate().trim().isEmpty()) {
                throw new RuntimeException("Biển số xe không được để trống");
            }
        }
        
        // Validate license plate uniqueness (excluding current vehicle)
        if (request.getLicensePlate() != null && !request.getLicensePlate().trim().isEmpty()) {
            String normalizedPlate = request.getLicensePlate().replaceAll("[^a-zA-Z0-9]", "");
            if (vehicleRepository.existsByNormalizedLicensePlateAndIdNot(normalizedPlate, vehicleId)) {
                throw new RuntimeException("Biển số xe đã tồn tại trong hệ thống");
            }
        }
        
        vehicle.setVehicleType(request.getVehicleType());
        vehicle.setBrand(request.getBrand());
        vehicle.setModel(request.getModel());
        vehicle.setLicensePlate(request.getLicensePlate());
        vehicle.setBatteryCapacity(request.getBatteryCapacity());
        vehicle.setConnectorType(request.getConnectorType());
        
        ElectricVehicle updatedVehicle = vehicleRepository.save(vehicle);
        return convertToDTO(updatedVehicle);
    }
    
    @Override
    @Transactional
    public void deleteVehicle(Integer vehicleId, Integer customerId) {
        ElectricVehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phương tiện"));
        
        if (!Objects.equals(vehicle.getCustomer().getId(), customerId)) {
            throw new RuntimeException("Bạn không có quyền xóa phương tiện này");
        }
        
        // Check if vehicle has active charging session
        if (vehicleRepository.hasActiveChargingSession(vehicleId)) {
            throw new RuntimeException("Không thể xóa phương tiện đang trong phiên sạc");
        }
        
        // Check if vehicle has any history (charging sessions)
        if (vehicle.getChargingSessions() != null && !vehicle.getChargingSessions().isEmpty()) {
            // Soft delete: we could add a 'deleted' field in the future
            // For now, just prevent deletion if has history
            throw new RuntimeException("Không thể xóa phương tiện đã có lịch sử sạc. Vui lòng liên hệ quản trị viên.");
        }
        
        vehicleRepository.delete(vehicle);
    }
    
    private VehicleDTO convertToDTO(ElectricVehicle vehicle) {
        log.debug("Converting vehicle {} to DTO", vehicle.getId());
        try {
            VehicleDTO dto = new VehicleDTO();
            dto.setId(vehicle.getId());
            dto.setVehicleType(vehicle.getVehicleType());
            dto.setBrand(vehicle.getBrand());
            dto.setModel(vehicle.getModel());
            dto.setLicensePlate(vehicle.getLicensePlate());
            dto.setBatteryCapacity(vehicle.getBatteryCapacity());
            dto.setConnectorType(vehicle.getConnectorType());
            
            log.debug("Checking active session for vehicle {}", vehicle.getId());
            boolean hasActiveSession = vehicleRepository.hasActiveChargingSession(vehicle.getId());
            dto.setHasActiveSession(hasActiveSession);
            
            log.debug("Successfully converted vehicle {} to DTO", vehicle.getId());
            return dto;
        } catch (Exception e) {
            log.error("Error converting vehicle {} to DTO: {}", vehicle.getId(), e.getMessage(), e);
            throw e;
        }
    }
}
