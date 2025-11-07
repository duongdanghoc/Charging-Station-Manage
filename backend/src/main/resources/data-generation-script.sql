-- =============================================
-- Electric Vehicle Charging STATION Database
-- Spring Boot Data Generation Script (PostgreSQL)
-- SỬ DỤNG VARCHAR THAY VÌ ENUM TYPES
-- =============================================

-- Drop tables if exists (in reverse order of dependencies)
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

-- =============================================
-- Create Tables (VARCHAR instead of ENUM)
-- =============================================

-- Vendors Table
CREATE TABLE vendors (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone CHAR(11) NOT NULL,
    status SMALLINT DEFAULT 1 CHECK (status IN (0, 1))
);

-- Customers Table
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone CHAR(11),
    status SMALLINT DEFAULT 1 CHECK (status IN (0, 1))
);

-- Locations Table
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    province VARCHAR(255) NOT NULL,
    address_detail TEXT NOT NULL
);

-- Stations Table
CREATE TABLE stations (
    id SERIAL PRIMARY KEY,
    vendor_id INT NOT NULL,
    location_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    status SMALLINT DEFAULT 1 CHECK (status IN (0, 1)),
    type VARCHAR(50) NOT NULL CHECK (type IN ('CAR', 'MOTORBIKE', 'BICYCLE')),
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

-- Ratings Table
CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL,
    target_type VARCHAR(50) NOT NULL CHECK (target_type IN ('VENDOR', 'STATION', 'RESCUE_STATION')),
    target_id INT NOT NULL,
    stars INT NOT NULL CHECK (stars >= 1 AND stars <= 5),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    comment TEXT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    UNIQUE (customer_id, target_type, target_id)
);

-- Charging Poles Table
CREATE TABLE charging_poles (
    id SERIAL PRIMARY KEY,
    station_id INT NOT NULL,
    manufacturer VARCHAR(255) NOT NULL,
    max_power DECIMAL(10, 2) NOT NULL,
    connector_count INT NOT NULL DEFAULT 1,
    install_date DATE,
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
);

-- Charging Connectors Table
CREATE TABLE charging_connectors (
    id SERIAL PRIMARY KEY,
    pole_id INT NOT NULL,
    connector_type VARCHAR(50) NOT NULL CHECK (connector_type IN ('TYPE1', 'TYPE2', 'CHADEMO', 'CCS', 'TESLA')),
    max_power DECIMAL(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'IN_USE', 'OUT_OF_SERVICE')),
    FOREIGN KEY (pole_id) REFERENCES charging_poles(id) ON DELETE CASCADE
);

-- Electric Vehicles Table
CREATE TABLE electric_vehicles (
    id SERIAL PRIMARY KEY,
    customer_id INT NOT NULL,
    vehicle_type VARCHAR(50) NOT NULL CHECK (vehicle_type IN ('CAR', 'MOTORBIKE', 'BICYCLE')),
    brand VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    license_plate VARCHAR(50) UNIQUE NOT NULL,
    battery_capacity DECIMAL(10, 2) NOT NULL,
    connector_type VARCHAR(50) NOT NULL CHECK (connector_type IN ('TYPE1', 'TYPE2', 'CHADEMO', 'CCS', 'TESLA')),
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Charging Sessions Table
CREATE TABLE charging_sessions (
    id SERIAL PRIMARY KEY,
    electric_vehicle_id INT NOT NULL,
    charging_connector_id INT NOT NULL,
    start_time TIMESTAMP NULL,
    end_time TIMESTAMP NULL,
    energy_kwh DECIMAL(10, 2),
    cost DECIMAL(15, 2),
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'CHARGING', 'COMPLETED', 'CANCELLED', 'FAILED')),
    FOREIGN KEY (electric_vehicle_id) REFERENCES electric_vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (charging_connector_id) REFERENCES charging_connectors(id) ON DELETE CASCADE
);

-- Transactions Table
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    charging_session_id INT UNIQUE NOT NULL,
    customer_id INT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('CASH', 'CREDIT_CARD', 'E_WALLET', 'BANK_TRANSFER')),
    payment_status VARCHAR(50) NOT NULL DEFAULT 'PENDING' CHECK (payment_status IN ('PENDING', 'PAID', 'FAILED', 'REFUNDED')),
    bank_name VARCHAR(255),
    account_number VARCHAR(50),
    payment_time TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (charging_session_id) REFERENCES charging_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Prices Table
CREATE TABLE prices (
    id SERIAL PRIMARY KEY,
    charging_pole_id INT,
    name VARCHAR(50) NOT NULL CHECK (name IN ('PENALTY', 'CHARGING')),
    price DECIMAL(15, 2),
    effective_from DATE NOT NULL,
    effective_to DATE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    FOREIGN KEY (charging_pole_id) REFERENCES charging_poles(id) ON DELETE CASCADE
);

-- Rescue Stations Table
CREATE TABLE rescue_stations (
    id SERIAL PRIMARY KEY,
    location_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone CHAR(11) NOT NULL,
    email VARCHAR(255),
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

-- =============================================
-- Sample Data
-- =============================================

-- Insert sample vendors
INSERT INTO vendors (name, email, password, phone, status) VALUES
('VinFast Charging', 'contact@vinfast.vn', '$2a$10$encrypted_password_1', '02412345678', 1),
('EVN Charging', 'info@evn.vn', '$2a$10$encrypted_password_2', '02487654321', 1),
('Green Energy', 'support@greenenergy.vn', '$2a$10$encrypted_password_3', '02456789012', 1);

-- Insert sample customers
INSERT INTO customers (name, email, password, phone, status) VALUES
('Nguyễn Văn A', 'nguyenvana@gmail.com', '$2a$10$encrypted_password_4', '0912345678', 1),
('Trần Thị B', 'tranthib@gmail.com', '$2a$10$encrypted_password_5', '0987654321', 1),
('Lê Văn C', 'levanc@gmail.com', '$2a$10$encrypted_password_6', '0901234567', 1);

-- Insert sample locations
INSERT INTO locations (latitude, longitude, province, address_detail) VALUES
(21.0285, 105.8542, 'Hà Nội', '123 Đường Láng, Đống Đa'),
(10.7769, 106.7009, 'TP. Hồ Chí Minh', '456 Nguyễn Huệ, Quận 1'),
(16.0544, 108.2022, 'Đà Nẵng', '789 Trần Phú, Hải Châu');

-- Insert sample stations
INSERT INTO stations (vendor_id, location_id, name, open_time, close_time, status, type) VALUES
(1, 1, 'VinFast Station Hà Nội', '06:00:00', '22:00:00', 1, 'CAR'),
(2, 2, 'EVN Station Sài Gòn', '00:00:00', '23:59:59', 1, 'CAR'),
(3, 3, 'Green Station Đà Nẵng', '07:00:00', '21:00:00', 1, 'MOTORBIKE');

-- Insert sample charging poles
INSERT INTO charging_poles (station_id, manufacturer, max_power, connector_count, install_date) VALUES
(1, 'ABB', 150.00, 2, '2024-01-15'),
(2, 'Schneider', 120.00, 4, '2024-02-20'),
(3, 'Siemens', 50.00, 2, '2024-03-10');

-- Insert sample charging connectors
INSERT INTO charging_connectors (pole_id, connector_type, max_power, status) VALUES
(1, 'CCS', 150.00, 'AVAILABLE'),
(1, 'TYPE2', 100.00, 'AVAILABLE'),
(2, 'CCS', 120.00, 'IN_USE'),
(2, 'CHADEMO', 100.00, 'AVAILABLE'),
(3, 'TYPE2', 50.00, 'AVAILABLE');

-- Insert sample electric vehicles
INSERT INTO electric_vehicles (customer_id, vehicle_type, brand, model, license_plate, battery_capacity, connector_type) VALUES
(1, 'CAR', 'VinFast', 'VF8', '30A-12345', 87.70, 'CCS'),
(2, 'CAR', 'Tesla', 'Model 3', '51G-67890', 75.00, 'TESLA'),
(3, 'MOTORBIKE', 'VinFast', 'Klara S', '29X-11111', 3.50, 'TYPE2');