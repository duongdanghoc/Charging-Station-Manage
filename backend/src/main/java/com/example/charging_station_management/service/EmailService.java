package com.example.charging_station_management.service;

public interface EmailService {
    void sendPasswordResetEmail(String toEmail, String resetToken);
}
