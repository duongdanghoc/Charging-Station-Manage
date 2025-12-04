-- =============================================
-- Electric Vehicle Charging STATION Database
-- PostgreSQL - Compatible with Spring Boot JPA
-- SỬ DỤNG VARCHAR THAY VÌ ENUM TYPES
-- =============================================

-- Drop tables in reverse dependency order
DROP TABLE IF EXISTS prices CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS charging_sessions CASCADE;
DROP TABLE IF EXISTS electric_vehicles CASCADE;
DROP TABLE IF EXISTS charging_connectors CASCADE;
DROP TABLE IF EXISTS charging_poles CASCADE;
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS rescue_stations CASCADE;
DROP TABLE IF EXISTS stations CASCADE;
DROP TABLE IF EXISTS locations CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- =============================================
-- USERS TABLE
-- =============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    user_type VARCHAR(20) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    status SMALLINT DEFAULT 1 CHECK (status IN (0, 1))
);

-- =============================================
-- CUSTOMERS TABLE
-- =============================================
CREATE TABLE customers (
    user_id INT PRIMARY KEY,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================
-- VENDORS TABLE
-- =============================================
CREATE TABLE vendors (
    user_id INT PRIMARY KEY,
    company_name VARCHAR(255),
    business_license VARCHAR(100),
    tax_code VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- =============================================
-- LOCATIONS TABLE
-- =============================================
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    province VARCHAR(255) NOT NULL,
    address_detail TEXT NOT NULL
);

-- =============================================
-- STATIONS TABLE
-- =============================================
CREATE TABLE stations (
    id SERIAL PRIMARY KEY,
    vendor_id INT NOT NULL,
    location_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    status SMALLINT,
    type VARCHAR(50) NOT NULL,
    FOREIGN KEY (vendor_id) REFERENCES vendors(user_id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

-- =============================================
-- RATINGS TABLE
-- =============================================
CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id INT NOT NULL,
    stars INT NOT NULL CHECK (stars BETWEEN 1 AND 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    comment TEXT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(user_id) ON DELETE CASCADE,
    UNIQUE (customer_id, target_type, target_id)
);

-- =============================================
-- CHARGING POLES TABLE
-- =============================================
CREATE TABLE charging_poles (
    id SERIAL PRIMARY KEY,
    station_id INT NOT NULL,
    manufacturer VARCHAR(255) NOT NULL,
    max_power DECIMAL(10,2) NOT NULL,
    connector_count INT DEFAULT 1,
    install_date DATE,
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
);

-- =============================================
-- CHARGING CONNECTORS TABLE
-- =============================================
CREATE TABLE charging_connectors (
    id SERIAL PRIMARY KEY,
    pole_id INT NOT NULL,
    connector_type VARCHAR(50) NOT NULL,
    max_power DECIMAL(10,2) NOT NULL,
    status VARCHAR(50),
    FOREIGN KEY (pole_id) REFERENCES charging_poles(id) ON DELETE CASCADE
);

-- =============================================
-- ELECTRIC VEHICLES TABLE
-- =============================================
CREATE TABLE electric_vehicles (
    id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    license_plate VARCHAR(50) UNIQUE NOT NULL,
    battery_capacity DECIMAL(10,2) NOT NULL,
    connector_type VARCHAR(50) NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(user_id) ON DELETE CASCADE
);

-- =============================================
-- CHARGING SESSIONS TABLE
-- =============================================
CREATE TABLE charging_sessions (
    id SERIAL PRIMARY KEY,
    electric_vehicle_id INT NOT NULL,
    charging_connector_id INT NOT NULL,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    energy_kwh DECIMAL(10,2),
    cost DECIMAL(15,2),
    status VARCHAR(50),
    FOREIGN KEY (electric_vehicle_id) REFERENCES electric_vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (charging_connector_id) REFERENCES charging_connectors(id) ON DELETE CASCADE
);

-- =============================================
-- TRANSACTIONS TABLE
-- =============================================
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    charging_session_id INT UNIQUE NOT NULL,
    customer_id INT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    payment_status VARCHAR(50),
    bank_name VARCHAR(255),
    account_number VARCHAR(50),
    payment_time TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (charging_session_id) REFERENCES charging_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(user_id) ON DELETE CASCADE
);

-- =============================================
-- PRICES TABLE
-- =============================================
CREATE TABLE prices (
    id SERIAL PRIMARY KEY,
    charging_pole_id INT NOT NULL,
    name VARCHAR(50) NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    effective_from DATE NOT NULL,
    effective_to DATE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    FOREIGN KEY (charging_pole_id) REFERENCES charging_poles(id) ON DELETE CASCADE
);

-- =============================================
-- RESCUE STATIONS TABLE
-- =============================================
CREATE TABLE rescue_stations (
    id SERIAL PRIMARY KEY,
    location_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(255),
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

-- =============================================
-- SAMPLE DATA
-- =============================================

-- Insert users (customers)
INSERT INTO users (user_type, name, email, password, phone, status) VALUES
('CUSTOMER', 'Nguyễn Văn A', 'nguyenvana@gmail.com', '$2a$10$encrypted_password_1', '0912345678', 1),
('CUSTOMER', 'Trần Thị B', 'tranthib@gmail.com', '$2a$10$encrypted_password_2', '0987654321', 1),
('CUSTOMER', 'Lê Văn C', 'levanc@gmail.com', '$2a$10$encrypted_password_3', '0901234567', 1);

INSERT INTO customers (user_id)
SELECT id FROM users WHERE user_type = 'CUSTOMER';

-- Insert vendors
INSERT INTO users (user_type, name, email, password, phone, status) VALUES
('VENDOR', 'VinFast Charging', 'contact@vinfast.vn', '$2a$10$encrypted_password_4', '02412345678', 1),
('VENDOR', 'EVN Charging', 'info@evn.vn', '$2a$10$encrypted_password_5', '02487654321', 1),
('VENDOR', 'Green Energy', 'support@greenenergy.vn', '$2a$10$encrypted_password_6', '02456789012', 1);

INSERT INTO vendors (user_id, company_name, business_license, tax_code)
SELECT id, name, 'BL' || id, 'TC' || id
FROM users WHERE user_type = 'VENDOR';

-- Insert locations
INSERT INTO locations (latitude, longitude, province, address_detail) VALUES
(21.0285, 105.8542, 'Hà Nội', '123 Đường Láng, Đống Đa'),
(10.7769, 106.7009, 'TP. Hồ Chí Minh', '456 Nguyễn Huệ, Quận 1'),
(16.0544, 108.2022, 'Đà Nẵng', '789 Trần Phú, Hải Châu');

-- Insert stations
INSERT INTO stations (vendor_id, location_id, name, open_time, close_time, status, type) VALUES
((SELECT user_id FROM vendors LIMIT 1 OFFSET 0), 1, 'VinFast Station Hà Nội', '06:00:00', '22:00:00', 1, 'CAR'),
((SELECT user_id FROM vendors LIMIT 1 OFFSET 1), 2, 'EVN Station Sài Gòn', '00:00:00', '23:59:59', 1, 'CAR'),
((SELECT user_id FROM vendors LIMIT 1 OFFSET 2), 3, 'Green Station Đà Nẵng', '07:00:00', '21:00:00', 1, 'MOTORBIKE');

-- Charging poles
INSERT INTO charging_poles (station_id, manufacturer, max_power, connector_count, install_date) VALUES
(1, 'ABB', 150.00, 2, '2024-01-15'),
(2, 'Schneider', 120.00, 4, '2024-02-20'),
(3, 'Siemens', 50.00, 2, '2024-03-10');

-- Charging connectors
INSERT INTO charging_connectors (pole_id, connector_type, max_power, status) VALUES
(1, 'CCS', 150.00, 'AVAILABLE'),
(1, 'TYPE2', 100.00, 'AVAILABLE'),
(2, 'CCS', 120.00, 'IN_USE'),
(2, 'CHADEMO', 100.00, 'AVAILABLE'),
(3, 'TYPE2', 50.00, 'AVAILABLE');

-- Electric vehicles
INSERT INTO electric_vehicles (customer_id, vehicle_type, brand, model, license_plate, battery_capacity, connector_type) VALUES
((SELECT user_id FROM customers LIMIT 1 OFFSET 0), 'CAR', 'VinFast', 'VF8', '30A-12345', 87.70, 'CCS'),
((SELECT user_id FROM customers LIMIT 1 OFFSET 1), 'CAR', 'Tesla', 'Model 3', '51G-67890', 75.00, 'TESLA'),
((SELECT user_id FROM customers LIMIT 1 OFFSET 2), 'MOTORBIKE', 'VinFast', 'Klara S', '29X-11111', 3.50, 'TYPE2');
-- 1. Tạo thông tin cơ bản trong bảng USERS
-- Lưu ý: user_type phải là 'ADMIN' để khớp với @DiscriminatorValue("ADMIN") trong code Java
INSERT INTO users (id, name, email, password, phone, status, user_type)
VALUES (999, 'Super Admin', 'admin@wayo.com', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQiy.u', '0909000000', 1, 'ADMIN');
-- (Mật khẩu trên là mã hóa của: 123456)

-- 2. Tạo thông tin chi tiết trong bảng ADMINS
-- ID phải trùng với ID ở bảng users (999)
INSERT INTO admins (id) VALUES (999);
