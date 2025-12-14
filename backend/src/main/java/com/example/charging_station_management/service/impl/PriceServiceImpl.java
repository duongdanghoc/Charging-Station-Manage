package com.example.charging_station_management.service.impl;

import com.example.charging_station_management.dto.request.CreatePriceRequest;
import com.example.charging_station_management.dto.request.UpdatePriceRequest;
import com.example.charging_station_management.dto.response.PriceResponse;
import com.example.charging_station_management.entity.converters.ChargingPole;
import com.example.charging_station_management.entity.converters.Price;
import com.example.charging_station_management.entity.converters.Vendor;
import com.example.charging_station_management.entity.enums.PriceName;
import com.example.charging_station_management.exception.ResourceNotFoundException;
import com.example.charging_station_management.repository.ChargingPoleRepository;
import com.example.charging_station_management.repository.PriceRepository;
import com.example.charging_station_management.service.PriceService;
import com.example.charging_station_management.utils.helper.UserHelper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PriceServiceImpl implements PriceService {

    private final PriceRepository priceRepository;
    private final ChargingPoleRepository chargingPoleRepository;
    private final UserHelper userHelper;

    @Override
    @Transactional
    public PriceResponse createPrice(CreatePriceRequest request) {
        // SỬ DỤNG HÀM getVendorLogin() MỚI
        Vendor currentVendor = userHelper.getVendorLogin();

        // 1. Check quyền: Trụ sạc có thuộc về Vendor đang login không
        // Sử dụng currentVendor.getId() thay vì ép kiểu thủ công
        ChargingPole pole = chargingPoleRepository.findByIdAndVendorId(request.getChargingPoleId(), currentVendor.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Charging Pole not found or access denied"));

        // 2. Validate logic thời gian
        validateTimeFrame(request.getStartTime(), request.getEndTime());
        
        if (request.getEffectiveTo() != null && request.getEffectiveTo().isBefore(request.getEffectiveFrom())) {
             throw new IllegalArgumentException("Ngày kết thúc phải sau hoặc bằng ngày bắt đầu");
        }
        // 3. Check trùng lặp khung giờ (Overlap)
        checkOverlapping(pole.getId(), request.getName(), -1,
                request.getEffectiveFrom(), request.getEffectiveTo(),
                request.getStartTime(), request.getEndTime());

        // 4. Map & Save
        Price price = new Price();
        price.setPole(pole);
        price.setName(request.getName());
        price.setPrice(request.getPrice());
        price.setEffectiveFrom(request.getEffectiveFrom());
        price.setEffectiveTo(request.getEffectiveTo());
        price.setStartTime(request.getStartTime());
        price.setEndTime(request.getEndTime());

        return mapToResponse(priceRepository.save(price));
    }

    @Override
    @Transactional
    public PriceResponse updatePrice(Integer id, UpdatePriceRequest request) {
        Vendor currentVendor = userHelper.getVendorLogin();

        Price price = priceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Price config not found"));

        // Check quyền sở hữu: Price -> Pole -> Station -> Vendor
        if (price.getPole().getStation().getVendor().getId() != currentVendor.getId()) {
            throw new ResourceNotFoundException("Access denied");
        }

        // Cập nhật các trường
        if (request.getName() != null) price.setName(request.getName());
        if (request.getPrice() != null) price.setPrice(request.getPrice());
        if (request.getEffectiveFrom() != null) price.setEffectiveFrom(request.getEffectiveFrom());
        if (request.getEffectiveTo() != null) price.setEffectiveTo(request.getEffectiveTo());
        if (request.getStartTime() != null) price.setStartTime(request.getStartTime());
        if (request.getEndTime() != null) price.setEndTime(request.getEndTime());

        // Validate lại logic
        validateTimeFrame(price.getStartTime(), price.getEndTime());
        checkOverlapping(price.getPole().getId(), price.getName(), price.getId(),
                price.getEffectiveFrom(), price.getEffectiveTo(),
                price.getStartTime(), price.getEndTime());

        return mapToResponse(priceRepository.save(price));
    }

    @Override
    @Transactional
    public void deletePrice(Integer id) {
        Vendor currentVendor = userHelper.getVendorLogin();

        Price price = priceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Price config not found"));

        if (price.getPole().getStation().getVendor().getId() != currentVendor.getId()) {
            throw new ResourceNotFoundException("Access denied");
        }

        priceRepository.delete(price);
    }

    @Override
    public List<PriceResponse> getPricesByPole(Integer poleId) {
        Vendor currentVendor = userHelper.getVendorLogin();

        // Kiểm tra quyền truy cập trụ sạc
        chargingPoleRepository.findByIdAndVendorId(poleId, currentVendor.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Pole not found or access denied"));

        return priceRepository.findByPoleId(poleId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public PriceResponse getPriceById(Integer id) {
        Vendor currentVendor = userHelper.getVendorLogin();

        Price price = priceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Price not found"));

        // Bảo mật: Chỉ vendor sở hữu mới xem được chi tiết
        if (price.getPole().getStation().getVendor().getId() != currentVendor.getId()) {
            throw new ResourceNotFoundException("Access denied");
        }

        return mapToResponse(price);
    }

    // --- Helper Methods ---

    private void validateTimeFrame(LocalTime start, LocalTime end) {
        if (!start.isBefore(end)) {
            throw new IllegalArgumentException("Start time must be strictly before End time");
        }
    }

    private void checkOverlapping(Integer poleId, PriceName name, Integer excludeId,
                                  LocalDate efFrom, LocalDate efTo, LocalTime start, LocalTime end) {
        List<Price> overlaps = priceRepository.findOverlappingPrices(poleId, name, excludeId, efFrom, efTo, start, end);
        if (!overlaps.isEmpty()) {
            throw new IllegalArgumentException("Time frame overlaps with an existing price configuration for this pole.");
        }
    }

    private PriceResponse mapToResponse(Price price) {
        LocalDate now = LocalDate.now();
        LocalTime timeNow = LocalTime.now();

        boolean dateValid = (price.getEffectiveTo() == null || !now.isAfter(price.getEffectiveTo()))
                && !now.isBefore(price.getEffectiveFrom());
        
        // Active khi trong ngày hiệu lực VÀ trong khung giờ hiệu lực
        boolean timeValid = !timeNow.isBefore(price.getStartTime()) && !timeNow.isAfter(price.getEndTime());

        return PriceResponse.builder()
                .id(price.getId())
                .chargingPoleId(price.getPole().getId())
                .chargingPoleName(price.getPole().getManufacturer()) 
                .name(price.getName())
                .price(price.getPrice())
                .effectiveFrom(price.getEffectiveFrom())
                .effectiveTo(price.getEffectiveTo())
                .startTime(price.getStartTime())
                .endTime(price.getEndTime())
                .isActive(dateValid && timeValid)
                .build();
    }
}