package com.example.charging_station_management.controller.auth;

import com.example.charging_station_management.dto.request.ChangePasswordRequest;
import com.example.charging_station_management.dto.request.LoginRequest;
import com.example.charging_station_management.dto.request.RegisterRequest;
import com.example.charging_station_management.dto.response.ChangePasswordResponse;
import com.example.charging_station_management.dto.response.JwtResponse;
import com.example.charging_station_management.dto.response.RegisterResponse;
import com.example.charging_station_management.dto.response.UserInfoResponse;
import com.example.charging_station_management.exception.PasswordValidationException;
import com.example.charging_station_management.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Cookie;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import com.example.charging_station_management.utils.CustomUserDetails;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = { "http://localhost:3000", "http://localhost:3001" })
public class AuthController {

    private final AuthService authService;

    /**
     * Register new user (Customer or Vendor)
     */
    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Registration request received for email: {}", request.getEmail());
        RegisterResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Login user and return JWT token
     */
    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        log.info("Login request received for email: {}", loginRequest.getEmail());
        JwtResponse jwtResponse = authService.authenticateUser(loginRequest);
        return ResponseEntity.ok(jwtResponse);
    }

    /**
     * Get current authenticated user info
     */
    @GetMapping("/me")
    public ResponseEntity<UserInfoResponse> getCurrentUser(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        if (userDetails == null) {
            log.warn("Unauthenticated request to /me endpoint");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        log.info("User info requested for: {}", userDetails.getEmail());

        UserInfoResponse response = new UserInfoResponse(
                userDetails.getId(),
                userDetails.getEmail(),
                userDetails.getName(),
                userDetails.getPhone(),
                userDetails.getRole());

        return ResponseEntity.ok(response);
    }

    /**
     * Logout: clear server-side session / security context and any refresh-token
     * cookies.
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout(
            HttpServletRequest request,
            HttpServletResponse response,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            log.info("Logout request received for user: {}",
                    userDetails == null ? "anonymous" : userDetails.getEmail());

            SecurityContextHolder.clearContext();

            try {
                Cookie cookie = new Cookie("refreshToken", null);
                cookie.setMaxAge(0);
                cookie.setPath("/");
                cookie.setHttpOnly(true);
                response.addCookie(cookie);
            } catch (Exception e) {
                log.debug("No refresh token cookie to clear or cookie clearing not necessary.", e);
            }

            return ResponseEntity.ok().body(java.util.Map.of("message", "Logged out successfully"));
        } catch (Exception e) {
            log.error("Error during logout", e);
            return ResponseEntity.internalServerError().body(java.util.Map.of("error", e.getMessage()));
        }
    }

    /**
     * Change password for authenticated user
     */
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @Valid @RequestBody ChangePasswordRequest request,
            BindingResult bindingResult,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        try {
            // Check authentication
            if (userDetails == null) {
                log.warn("Unauthenticated request to change password");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "Bạn cần đăng nhập để thực hiện chức năng này"));
            }

            if (bindingResult.hasErrors()) {
                Map<String, String> errors = new HashMap<>();
                bindingResult.getFieldErrors().forEach(error ->
                        errors.put(error.getField(), error.getDefaultMessage())
                );
                log.warn("Validation errors for change password: {}", errors);
                return ResponseEntity.badRequest().body(Map.of("errors", errors));
            }

            ChangePasswordResponse response = authService.changePassword(
                    userDetails.getId(),
                    request
            );

            return ResponseEntity.ok(response);

        } catch (PasswordValidationException e) {
            log.warn("Password validation failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            log.error("Error changing password", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("error", "Có lỗi xảy ra khi đổi mật khẩu"));
        }
    }
}
