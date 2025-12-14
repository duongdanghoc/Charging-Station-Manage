/* ==========================================================================
   1. DROP EXISTING TABLES (Theo thứ tự khóa ngoại để tránh lỗi)
   ========================================================================== */

DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS charging_sessions;
DROP TABLE IF EXISTS electric_vehicles;
DROP TABLE IF EXISTS prices;
DROP TABLE IF EXISTS charging_connectors;
DROP TABLE IF EXISTS charging_poles;
DROP TABLE IF EXISTS stations;
DROP TABLE IF EXISTS rescue_stations;
DROP TABLE IF EXISTS locations;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS vendors;
DROP TABLE IF EXISTS admins;
DROP TABLE IF EXISTS users CASCADE;

/* ==========================================================================
   2. CREATE TABLES
   ========================================================================== */

-- 2.1 Bảng cha: users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(11) NOT NULL,
    status INTEGER,
    user_type VARCHAR(31) NOT NULL -- Discriminator column
);

-- 2.2 Các bảng con kế thừa từ users
CREATE TABLE admins (
    id INTEGER PRIMARY KEY REFERENCES users(id)
);

CREATE TABLE vendors (
    user_id INTEGER PRIMARY KEY REFERENCES users(id)
);

CREATE TABLE customers (
    user_id INTEGER PRIMARY KEY REFERENCES users(id)
);

-- 2.3 Locations
CREATE TABLE locations (
    id SERIAL PRIMARY KEY,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    province VARCHAR(255) NOT NULL,
    address_detail TEXT NOT NULL
);

-- 2.4 Rescue Stations
CREATE TABLE rescue_stations (
    id SERIAL PRIMARY KEY,
    location_id INTEGER NOT NULL REFERENCES locations(id),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(11) NOT NULL,
    email VARCHAR(255),
    open_time TIME NOT NULL,
    close_time TIME NOT NULL
);

-- 2.5 Stations (Vendor sở hữu)
CREATE TABLE stations (
    id SERIAL PRIMARY KEY,
    vendor_id INTEGER NOT NULL REFERENCES vendors(user_id),
    location_id INTEGER NOT NULL REFERENCES locations(id),
    name VARCHAR(255) NOT NULL,
    open_time TIME NOT NULL,
    close_time TIME NOT NULL,
    status INTEGER,
    type VARCHAR(100) NOT NULL -- Enum: VehicleType
);

-- 2.6 Charging Poles
CREATE TABLE charging_poles (
    id SERIAL PRIMARY KEY,
    station_id INTEGER NOT NULL REFERENCES stations(id),
    manufacturer VARCHAR(255) NOT NULL,
    max_power DECIMAL(10, 2) NOT NULL,
    connector_count INTEGER NOT NULL DEFAULT 1,
    install_date DATE
);

-- 2.7 Charging Connectors
CREATE TABLE charging_connectors (
    id SERIAL PRIMARY KEY,
    pole_id INTEGER NOT NULL REFERENCES charging_poles(id),
    connector_type VARCHAR(100) NOT NULL, -- Enum: ConnectorType
    max_power DECIMAL(10, 2) NOT NULL,
    status VARCHAR(100) NOT NULL -- Enum: ConnectorStatus
);

-- 2.8 Prices
CREATE TABLE prices (
    id SERIAL PRIMARY KEY,
    charging_pole_id INTEGER REFERENCES charging_poles(id),
    name VARCHAR(100) NOT NULL, -- Enum: PriceName
    price DECIMAL(15, 2),
    effective_from DATE NOT NULL,
    effective_to DATE,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);

-- 2.9 Electric Vehicles (Customer sở hữu)
CREATE TABLE electric_vehicles (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(user_id),
    vehicle_type VARCHAR(100) NOT NULL, -- Enum: VehicleType
    brand VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    license_plate VARCHAR(50) NOT NULL UNIQUE,
    battery_capacity DECIMAL(10, 2) NOT NULL,
    connector_type VARCHAR(100) NOT NULL -- Enum: ConnectorType
);

-- 2.10 Charging Sessions
CREATE TABLE charging_sessions (
    id SERIAL PRIMARY KEY,
    electric_vehicle_id INTEGER NOT NULL REFERENCES electric_vehicles(id),
    charging_connector_id INTEGER NOT NULL REFERENCES charging_connectors(id),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    energy_kwh DECIMAL(10, 2),
    cost DECIMAL(15, 2),
    status VARCHAR(100) NOT NULL -- Enum: SessionStatus
);

-- 2.11 Transactions
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    charging_session_id INTEGER NOT NULL UNIQUE REFERENCES charging_sessions(id),
    customer_id INTEGER NOT NULL REFERENCES customers(user_id),
    amount DECIMAL(15, 2) NOT NULL,
    payment_method VARCHAR(100) NOT NULL, -- Enum: PaymentMethod
    payment_status VARCHAR(100) NOT NULL, -- Enum: PaymentStatus
    bank_name VARCHAR(255),
    account_number VARCHAR(50),
    payment_time TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2.12 Ratings
CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(user_id),
    target_type VARCHAR(100) NOT NULL, -- Enum: TargetType
    target_id INTEGER NOT NULL,
    stars INTEGER NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    comment TEXT
);

-- Ràng buộc duy nhất cho Ratings
ALTER TABLE ratings ADD CONSTRAINT unique_rating_target UNIQUE (customer_id, target_type, target_id);

/* ==========================================================================
   3. INSERT SAMPLE DATA
   ========================================================================== */

-- 3.1 USERS (Total 5: 1 Admin, 2 Vendors, 2 Customers)
-- Password mặc định: Tramsac@123 -> $2a$12$iTOeSm.NoT8jH6wKIfmrKulOeA90vmz58bmDeBQTdz7eDk2CRZDna

-- User 1: Admin
INSERT INTO users (name, email, password, phone, status, user_type)
VALUES ('System Admin', 'admin@wayo.com', '$2a$12$iTOeSm.NoT8jH6wKIfmrKulOeA90vmz58bmDeBQTdz7eDk2CRZDna', '0909000111', 1, 'ADMIN');
INSERT INTO admins (id) VALUES (1);

-- User 2: Vendor A
INSERT INTO users (name, email, password, phone, status, user_type)
VALUES ('VinCharge Solutions', 'contact@vincharge.vn', '$2a$12$iTOeSm.NoT8jH6wKIfmrKulOeA90vmz58bmDeBQTdz7eDk2CRZDna', '0909222333', 1, 'VENDOR');
INSERT INTO vendors (user_id) VALUES (2);

-- User 3: Vendor B
INSERT INTO users (name, email, password, phone, status, user_type)
VALUES ('E-Point Energy', 'support@epoint.com', '$2a$12$iTOeSm.NoT8jH6wKIfmrKulOeA90vmz58bmDeBQTdz7eDk2CRZDna', '0909444555', 1, 'VENDOR');
INSERT INTO vendors (user_id) VALUES (3);

-- User 4: Customer A (Sẽ có 2 xe)
INSERT INTO users (name, email, password, phone, status, user_type)
VALUES ('Nguyen Van An', 'an.nguyen@gmail.com', '$2a$12$iTOeSm.NoT8jH6wKIfmrKulOeA90vmz58bmDeBQTdz7eDk2CRZDna', '0912111222', 1, 'CUSTOMER');
INSERT INTO customers (user_id) VALUES (4);

-- User 5: Customer B (Sẽ có 3 xe)
INSERT INTO users (name, email, password, phone, status, user_type)
VALUES ('Tran Thi Binh', 'binh.tran@yahoo.com', '$2a$12$iTOeSm.NoT8jH6wKIfmrKulOeA90vmz58bmDeBQTdz7eDk2CRZDna', '0988777666', 1, 'CUSTOMER');
INSERT INTO customers (user_id) VALUES (5);


-- 3.2 LOCATIONS (5 dòng)
INSERT INTO locations (latitude, longitude, province, address_detail) VALUES
(10.7769, 106.7009, 'Hồ Chí Minh', '72 Lê Thánh Tôn, Bến Nghé, Quận 1'), -- Vincom Center
(21.0285, 105.8542, 'Hà Nội', '54A Nguyễn Chí Thanh, Láng Thượng, Đống Đa'), -- Vincom NCT
(16.0544, 108.2022, 'Đà Nẵng', '910A Ngô Quyền, An Hải Bắc, Sơn Trà'), -- Vincom Plaza
(10.7626, 106.6602, 'Hồ Chí Minh', '273 An Dương Vương, Phường 3, Quận 5'), -- ĐH Sư Phạm
(10.8231, 106.6297, 'Hồ Chí Minh', '10 Tân Kỳ Tân Quý, Tân Sơn Nhì, Tân Phú'); -- Aeon Mall

-- 3.3 RESCUE STATIONS (5 dòng)
INSERT INTO rescue_stations (location_id, name, phone, email, open_time, close_time) VALUES
(1, 'Cứu hộ Sài Gòn 247', '0901234567', 'sos@saigonrescue.com', '00:00:00', '23:59:59'),
(2, 'Gara Auto Cứu Hộ Hà Nội', '0987654321', 'hn_rescue@gmail.com', '07:00:00', '22:00:00'),
(3, 'Đội Cứu Hộ Sông Hàn', '0913555777', 'songhan_sos@danang.gov.vn', '00:00:00', '23:59:59'),
(4, 'Trạm Sửa Chữa Lưu Động Q5', '0933888999', 'suachuaq5@yahoo.com', '08:00:00', '18:00:00'),
(5, 'Aeon Rescue Point', '0283333444', 'help@aeon.com.vn', '09:00:00', '22:00:00');

-- 3.4 STATIONS (5 dòng - 3 của Vendor A, 2 của Vendor B)
-- Vendor 2 (VinCharge) owns 3 stations
INSERT INTO stations (vendor_id, location_id, name, open_time, close_time, status, type) VALUES
(2, 1, 'VinCharge Center Q1', '06:00:00', '23:00:00', 1, 'CAR'),
(2, 2, 'VinCharge NCT Hanoi', '00:00:00', '23:59:59', 1, 'CAR'),
(2, 3, 'VinCharge Da Nang', '07:00:00', '22:00:00', 0, 'MOTORBIKE');

-- Vendor 3 (E-Point) owns 2 stations
INSERT INTO stations (vendor_id, location_id, name, open_time, close_time, status, type) VALUES
(3, 4, 'E-Point University Hub', '05:00:00', '21:00:00', 1, 'MOTORBIKE'),
(3, 5, 'E-Point Mall Station', '09:00:00', '22:00:00', 1, 'BICYCLE');

-- 3.5 CHARGING POLES (5 dòng)
INSERT INTO charging_poles (station_id, manufacturer, max_power, connector_count, install_date) VALUES
(1, 'ABB', 150.00, 2, '2023-01-15'), -- Pole 1 at Station 1
(1, 'Siemens', 60.00, 1, '2023-02-20'), -- Pole 2 at Station 1
(2, 'Star Charge', 120.00, 2, '2023-03-10'), -- Pole 3 at Station 2
(4, 'Schneider', 11.00, 4, '2023-05-05'), -- Pole 4 at Station 4 (Motorbike)
(5, 'Bosch', 3.50, 10, '2023-06-01'); -- Pole 5 at Station 5 (Bicycle)

-- 3.6 CHARGING CONNECTORS (8 dòng - bao phủ ConnectorType & Status)
INSERT INTO charging_connectors (pole_id, connector_type, max_power, status) VALUES
(1, 'CCS', 150.00, 'AVAILABLE'),        -- Pole 1
(1, 'CHADEMO', 50.00, 'INUSE'),         -- Pole 1
(2, 'TYPE2', 22.00, 'AVAILABLE'),       -- Pole 2
(3, 'TESLA', 120.00, 'OUTOFSERVICE'),   -- Pole 3
(3, 'CCS', 100.00, 'AVAILABLE'),        -- Pole 3
(4, 'TYPE1', 3.50, 'AVAILABLE'),        -- Pole 4 (Motorbike)
(4, 'TYPE1', 3.50, 'INUSE'),            -- Pole 4
(5, 'TYPE2', 2.00, 'AVAILABLE');        -- Pole 5 (Bicycle)

-- 3.7 PRICES (5 dòng - Bao phủ PriceName)
INSERT INTO prices (charging_pole_id, name, price, effective_from, effective_to, start_time, end_time) VALUES
(1, 'CHARGING', 3500.00, '2023-01-01', NULL, '00:00:00', '23:59:59'), -- Giá sạc thường
(1, 'PENALTY', 50000.00, '2023-01-01', NULL, '00:00:00', '23:59:59'), -- Phí phạt chiếm chỗ
(3, 'CHARGING', 4000.00, '2023-06-01', '2023-12-31', '08:00:00', '18:00:00'), -- Giá giờ cao điểm
(3, 'CHARGING', 2500.00, '2023-06-01', '2023-12-31', '18:01:00', '07:59:00'), -- Giá giờ thấp điểm
(4, 'CHARGING', 1500.00, '2023-01-01', NULL, '00:00:00', '23:59:59');

-- 3.8 ELECTRIC VEHICLES (5 dòng - 2 của Cust A, 3 của Cust B)
-- Customer A (ID 4): 2 xe
INSERT INTO electric_vehicles (customer_id, vehicle_type, brand, model, license_plate, battery_capacity, connector_type) VALUES
(4, 'CAR', 'VinFast', 'VF8', '51K-123.45', 87.70, 'CCS'),
(4, 'MOTORBIKE', 'VinFast', 'Klara S', '59-M1 999.99', 3.50, 'TYPE1');

-- Customer B (ID 5): 3 xe
INSERT INTO electric_vehicles (customer_id, vehicle_type, brand, model, license_plate, battery_capacity, connector_type) VALUES
(5, 'CAR', 'Tesla', 'Model 3', '30H-567.89', 75.00, 'TESLA'),
(5, 'CAR', 'Hyundai', 'Ioniq 5', '30H-111.22', 72.60, 'CCS'),
(5, 'BICYCLE', 'Dat Bike', 'Weaver++', '29-B1 555.55', 5.00, 'TYPE2');

-- 3.9 CHARGING SESSIONS (5 dòng - Bao phủ SessionStatus)
INSERT INTO charging_sessions (electric_vehicle_id, charging_connector_id, start_time, end_time, energy_kwh, cost, status) VALUES
(1, 1, '2023-10-01 08:00:00', '2023-10-01 09:00:00', 45.5, 159250.00, 'COMPLETED'), -- Xe 1 sạc xong
(2, 6, '2023-10-02 10:00:00', NULL, 1.2, 5000.00, 'CHARGING'),               -- Xe 2 đang sạc
(3, 4, '2023-10-03 14:00:00', '2023-10-03 14:05:00', 0.1, 0.00, 'FAILED'),      -- Xe 3 lỗi
(4, 5, '2023-10-04 15:00:00', NULL, NULL, NULL, 'PENDING'),                     -- Xe 4 đặt trước
(5, 8, '2023-10-05 09:00:00', '2023-10-05 09:10:00', 0.5, 0.00, 'CANCELLED');   -- Xe 5 hủy

-- 3.10 TRANSACTIONS (5 dòng - Bao phủ PaymentMethod & PaymentStatus)
-- Gắn với Session 1 (Completed, Paid)
INSERT INTO transactions (charging_session_id, customer_id, amount, payment_method, payment_status, bank_name, account_number, payment_time) VALUES
(1, 4, 159250.00, 'CREDITCARD', 'PAID', 'Vietcombank', '****1234', '2023-10-01 09:01:00');

-- Gắn với Session 2 (Charging, Pending)
INSERT INTO transactions (charging_session_id, customer_id, amount, payment_method, payment_status, bank_name, account_number, payment_time) VALUES
(2, 4, 100000.00, 'EWALLET', 'PENDING', 'Momo', '0912111222', NULL); -- Tạm ứng

-- Gắn với Session 3 (Failed, Refunded)
INSERT INTO transactions (charging_session_id, customer_id, amount, payment_method, payment_status, bank_name, account_number, payment_time) VALUES
(3, 5, 50000.00, 'BANKTRASFER', 'REFUNDED', 'Techcombank', '190333444555', '2023-10-03 14:30:00');

-- Gắn với Session 4 (Pending, Failed Payment)
INSERT INTO transactions (charging_session_id, customer_id, amount, payment_method, payment_status, bank_name, account_number, payment_time) VALUES
(4, 5, 20000.00, 'CASH', 'FAILED', NULL, NULL, '2023-10-04 15:05:00');

-- Gắn với Session 5 (Cancelled, Void) - Tạo thêm một dòng cho đủ 5
INSERT INTO transactions (charging_session_id, customer_id, amount, payment_method, payment_status, bank_name, account_number, payment_time) VALUES
(5, 5, 0.00, 'EWALLET', 'PENDING', 'ZaloPay', '0988777666', NULL);

-- 3.11 RATINGS (5 dòng - Bao phủ TargetType)
-- Cust 4 rate Station
INSERT INTO ratings (customer_id, target_type, target_id, stars, comment, created_at) VALUES
(4, 'STATION', 1, 5, 'Trạm sạc rất nhanh và tiện lợi ngay trung tâm.', '2023-10-01 10:00:00');

-- Cust 4 rate Vendor
INSERT INTO ratings (customer_id, target_type, target_id, stars, comment, created_at) VALUES
(4, 'VENDOR', 2, 4, 'Dịch vụ của VinCharge khá tốt, nhưng app thỉnh thoảng lag.', '2023-10-02 09:00:00');

-- Cust 5 rate RescueStation
INSERT INTO ratings (customer_id, target_type, target_id, stars, comment, created_at) VALUES
(5, 'RESCUESTATION', 2, 5, 'Đến rất nhanh, thợ nhiệt tình.', '2023-10-03 16:00:00');

-- Cust 5 rate Station (khác)
INSERT INTO ratings (customer_id, target_type, target_id, stars, comment, created_at) VALUES
(5, 'STATION', 4, 3, 'Trạm xe máy hơi chật chội vào giờ cao điểm.', '2023-10-05 12:00:00');

-- Cust 5 rate Vendor (khác)
INSERT INTO ratings (customer_id, target_type, target_id, stars, comment, created_at) VALUES
(5, 'VENDOR', 3, 4, 'Giá cả hợp lý cho sinh viên.', '2023-10-06 14:00:00');
