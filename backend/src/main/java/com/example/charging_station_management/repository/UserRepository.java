package com.example.charging_station_management.repository;

import java.util.Optional;

import com.example.charging_station_management.entity.converters.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}