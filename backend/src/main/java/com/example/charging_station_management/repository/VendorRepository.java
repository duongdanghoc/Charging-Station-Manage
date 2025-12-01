package com.example.charging_station_management.repository;

import com.example.charging_station_management.entity.converters.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, Integer> {

}
