package com.example.charging_station_management.service;

import com.example.charging_station_management.dto.CreateVehicleRequest;
import com.example.charging_station_management.dto.UpdateVehicleRequest;
import com.example.charging_station_management.dto.VehicleDTO;

import java.util.List;

public interface VehicleService {
    
    List<VehicleDTO> getCustomerVehicles(Integer customerId);
    
    VehicleDTO getVehicleById(Integer vehicleId, Integer customerId);
    
    VehicleDTO createVehicle(CreateVehicleRequest request, Integer customerId);
    
    VehicleDTO updateVehicle(Integer vehicleId, UpdateVehicleRequest request, Integer customerId);
    
    void deleteVehicle(Integer vehicleId, Integer customerId);
}
