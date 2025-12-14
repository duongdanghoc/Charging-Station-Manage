package com.example.charging_station_management.service;

import com.example.charging_station_management.dto.request.CreatePriceRequest;
import com.example.charging_station_management.dto.request.UpdatePriceRequest;
import com.example.charging_station_management.dto.response.PriceResponse;

import java.util.List;

public interface PriceService {
    PriceResponse createPrice(CreatePriceRequest request);
    PriceResponse updatePrice(Integer id, UpdatePriceRequest request);
    void deletePrice(Integer id);
    List<PriceResponse> getPricesByPole(Integer poleId);
    PriceResponse getPriceById(Integer id);
}