package com.example.charging_station_management.service.impl;

import com.example.charging_station_management.dto.request.RegisterRequest;
import com.example.charging_station_management.dto.response.RegisterResponse;
import com.example.charging_station_management.entity.converters.Customer;
import com.example.charging_station_management.entity.converters.Vendor;
import com.example.charging_station_management.entity.enums.Role;
import com.example.charging_station_management.repository.CustomerRepository;
import com.example.charging_station_management.repository.VendorRepository;
import com.example.charging_station_management.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthServiceImpl implements AuthService {

    private final CustomerRepository customerRepository;
    private final VendorRepository vendorRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = false)
    public RegisterResponse register(RegisterRequest request) {

        log.info("Registering new user with email: {}", request.getEmail());

        if (isEmailExists(request.getEmail())) {
            log.warn("Registration failed: Email already exists - {}", request.getEmail());
            throw new RuntimeException("Email đã được sử dụng");
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());
        log.debug("Password encoded successfully");

        if (request.getRole() == Role.CUSTOMER) {
            return registerCustomer(request, encodedPassword);
        } else if (request.getRole() == Role.VENDOR) {
            return registerVendor(request, encodedPassword);
        } else {
            log.error("Invalid role: {}", request.getRole());
            throw new RuntimeException("Vai trò không hợp lệ");
        }
    }

    private RegisterResponse registerCustomer(RegisterRequest request, String encodedPassword) {
        log.info("Creating customer account for: {}", request.getEmail());

        Customer customer = new Customer();
        customer.setName(request.getName());
        customer.setEmail(request.getEmail());
        customer.setPassword(encodedPassword);
        customer.setPhone(request.getPhone());
        customer.setStatus(1);

        Customer savedCustomer = customerRepository.save(customer);
        log.info("Customer registered successfully with ID: {}", savedCustomer.getId());

        return new RegisterResponse(
                savedCustomer.getId(),
                savedCustomer.getName(),
                savedCustomer.getEmail(),
                savedCustomer.getPhone(),
                Role.CUSTOMER,
                "Đăng ký khách hàng thành công"
        );
    }

    private RegisterResponse registerVendor(RegisterRequest request, String encodedPassword) {
        log.info("Creating vendor account for: {}", request.getEmail());

        Vendor vendor = new Vendor();
        vendor.setName(request.getName());
        vendor.setEmail(request.getEmail());
        vendor.setPassword(encodedPassword);
        vendor.setPhone(request.getPhone());
        vendor.setStatus(1);

        Vendor savedVendor = vendorRepository.save(vendor);
        log.info("Vendor registered successfully with ID: {}", savedVendor.getId());

        return new RegisterResponse(
                savedVendor.getId(),
                savedVendor.getName(),
                savedVendor.getEmail(),
                savedVendor.getPhone(),
                Role.VENDOR,
                "Đăng ký nhà cung cấp thành công"
        );
    }

    private boolean isEmailExists(String email) {
        boolean exists = customerRepository.existsByEmail(email) ||
                vendorRepository.existsByEmail(email);
        log.debug("Email {} exists: {}", email, exists);
        return exists;
    }
}
