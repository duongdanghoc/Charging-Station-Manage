package com.example.charging_station_management.repository;

import com.example.charging_station_management.entity.converters.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor; // <-- Thêm import này
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends
    JpaRepository<User, Integer>,
    JpaSpecificationExecutor<User> { // <-- THÊM JpaSpecificationExecutor

    Optional<User> findByEmail(String email);

    Boolean existsByEmail(String email);
}
