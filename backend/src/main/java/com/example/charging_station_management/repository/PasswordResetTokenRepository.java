package com.example.charging_station_management.repository;

import com.example.charging_station_management.entity.converters.PasswordResetToken;
import com.example.charging_station_management.entity.converters.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Integer> {

    Optional<PasswordResetToken> findByToken(String token);

    List<PasswordResetToken> findByUser(User user);

    void deleteByExpiryDateBefore(LocalDateTime date);

    void deleteByUser(User user);
}