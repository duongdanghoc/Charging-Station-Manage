package com.example.charging_station_management.service.impl;

import com.example.charging_station_management.dto.request.ChangePasswordRequest;
import com.example.charging_station_management.dto.request.LoginRequest;
import com.example.charging_station_management.dto.request.RegisterRequest;
import com.example.charging_station_management.dto.response.ChangePasswordResponse;
import com.example.charging_station_management.dto.response.JwtResponse;
import com.example.charging_station_management.dto.response.RegisterResponse;
import com.example.charging_station_management.entity.converters.Customer;
import com.example.charging_station_management.entity.converters.User;
import com.example.charging_station_management.entity.converters.Vendor;
import com.example.charging_station_management.entity.enums.Role;
import com.example.charging_station_management.exception.PasswordValidationException;
import com.example.charging_station_management.repository.CustomerRepository;
import com.example.charging_station_management.repository.UserRepository;
import com.example.charging_station_management.repository.VendorRepository;
import com.example.charging_station_management.service.AuthService;
import com.example.charging_station_management.utils.JwtUtils;
import com.example.charging_station_management.utils.helper.UserHelper;
import com.example.charging_station_management.utils.validation.UserValidation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthServiceImpl implements AuthService {

    private final CustomerRepository customerRepository;
    private final VendorRepository vendorRepository;
    private final UserRepository userRepository;
    private final UserValidation userValidation;
    private final UserHelper userHelper;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = false)
    public RegisterResponse register(RegisterRequest request) {

        log.info("Registering new user with email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
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

    @Override
    public JwtResponse authenticateUser(LoginRequest loginRequest) {

        userValidation.validateLoginCredentials(loginRequest);

        User user = userHelper.findUserByEmail(loginRequest.getEmail());

        userValidation.validateUserAccountActive(user);

        // Authenticate user
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail(),
                        loginRequest.getPassword()));

        // Set authentication context
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Generate JWT token
        String jwt = jwtUtils.generateJwtToken(authentication);

        return new JwtResponse(
                jwt,
                user.getEmail(),
                user.getName(),
                determineUserRole(user));
    }

    @Override
    @Transactional(readOnly = false)
    public ChangePasswordResponse changePassword(Integer userId, ChangePasswordRequest request) {
        log.info("Change password request for user ID: {}", userId);

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            log.warn("Password confirmation does not match for user ID: {}", userId);
            throw new PasswordValidationException("Mật khẩu xác nhận không khớp");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.error("User not found with ID: {}", userId);
                    return new RuntimeException("Người dùng không tồn tại");
                });

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            log.warn("Current password is incorrect for user: {}", user.getEmail());
            throw new PasswordValidationException("Mật khẩu hiện tại không đúng");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            log.warn("New password is same as current password for user: {}", user.getEmail());
            throw new PasswordValidationException("Mật khẩu mới không được trùng với mật khẩu hiện tại");
        }

        String encodedNewPassword = passwordEncoder.encode(request.getNewPassword());
        user.setPassword(encodedNewPassword);
        userRepository.save(user);

        log.info("Password changed successfully for user: {}", user.getEmail());

        return new ChangePasswordResponse(
                "Đổi mật khẩu thành công",
                user.getEmail(),
                LocalDateTime.now());
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
                "Đăng ký khách hàng thành công");
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
                "Đăng ký nhà cung cấp thành công");
    }

    private Role determineUserRole(User user) {
        if (user instanceof Customer) {
            return Role.CUSTOMER;
        } else if (user instanceof Vendor) {
            return Role.VENDOR;
        }
        throw new RuntimeException("Unknown user type");
    }

}
