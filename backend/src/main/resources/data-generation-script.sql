-- =============================================
-- Electric Vehicle Charging Station Database
-- Spring Boot Data Generation Script
-- =============================================

-- Drop tables if exists (in reverse order of dependencies)
DROP TABLE IF EXISTS prices;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS charging_sessions;
DROP TABLE IF EXISTS electric_vehicles;
DROP TABLE IF EXISTS charging_connectors;
DROP TABLE IF EXISTS charging_poles;
DROP TABLE IF EXISTS ratings;
DROP TABLE IF EXISTS rescue_stations;
DROP TABLE IF EXISTS stations;
DROP TABLE IF EXISTS locations;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS vendors;

-- =============================================
-- Create Tables
-- =============================================

-- Vendors Table
CREATE TABLE vendors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone CHAR(11) NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active'
);

-- Customers Table
CREATE TABLE customers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone CHAR(11),
    status ENUM('active', 'inactive') DEFAULT 'active'
);

-- Locations Table
CREATE TABLE locations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    latitude DECIMAL(10, 8) NOT NULL COMMENT 'Vĩ độ',
    longitude DECIMAL(11, 8) NOT NULL COMMENT 'Kinh độ',
    province VARCHAR(255) NOT NULL COMMENT 'Tỉnh/Thành phố',
    address_detail TEXT NOT NULL COMMENT 'Số nhà, mô tả chi tiết'
);

-- Stations Table
CREATE TABLE stations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vendor_id INT NOT NULL,
    location_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    open_time TIME NOT NULL COMMENT 'Giờ mở cửa',
    close_time TIME NOT NULL COMMENT 'Giờ đóng cửa',
    status ENUM('active', 'inactive') DEFAULT 'active',
    type ENUM('car', 'motorbike', 'bicycle') NOT NULL,
    FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

-- Ratings Table
CREATE TABLE ratings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    target_type ENUM('Vendor', 'Station', 'Rescue Station') NOT NULL,
    target_id INT NOT NULL,
    stars INT NOT NULL COMMENT '1–5 sao',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT 'Mặc định now()',
    comment TEXT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
    UNIQUE KEY unique_rating (customer_id, target_type, target_id),
    CHECK (stars >= 1 AND stars <= 5)
);

-- Charging Poles Table
CREATE TABLE charging_poles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    station_id INT NOT NULL,
    manufacturer VARCHAR(255) NOT NULL,
    max_power DECIMAL(10, 2) NOT NULL COMMENT 'Công suất tối đa (kW)',
    connector_count INT NOT NULL DEFAULT 1,
    install_date DATE COMMENT 'Ngày lắp đặt trụ',
    FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE
);

-- Charging Connectors Table
CREATE TABLE charging_connectors (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pole_id INT NOT NULL,
    connector_type ENUM('Type1', 'Type2', 'CHAdeMO', 'CCS', 'Tesla') NOT NULL,
    max_power DECIMAL(10, 2) NOT NULL,
    status ENUM('available', 'in_use', 'out_of_service') NOT NULL DEFAULT 'available',
    FOREIGN KEY (pole_id) REFERENCES charging_poles(id) ON DELETE CASCADE
);

-- Electric Vehicles Table
CREATE TABLE electric_vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    vehicle_type ENUM('car', 'motorbike', 'bicycle') NOT NULL COMMENT 'Loại phương tiện',
    brand VARCHAR(255) NOT NULL COMMENT 'Hãng xe',
    model VARCHAR(255) NOT NULL COMMENT 'Dòng xe',
    license_plate VARCHAR(50) UNIQUE NOT NULL COMMENT 'Biển số xe',
    battery_capacity DECIMAL(10, 2) NOT NULL COMMENT 'Dung lượng pin (kWh)',
    connector_type ENUM('Type1', 'Type2', 'CHAdeMO', 'CCS', 'Tesla') NOT NULL COMMENT 'Loại đầu sạc tương thích',
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Charging Sessions Table
CREATE TABLE charging_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    electric_vehicle_id INT NOT NULL COMMENT 'Xe điện tham gia phiên sạc',
    charging_connector_id INT NOT NULL COMMENT 'Cổng sạc được sử dụng',
    start_time TIMESTAMP NULL COMMENT 'Thời gian bắt đầu sạc',
    end_time TIMESTAMP NULL COMMENT 'Thời gian kết thúc sạc',
    energy_kwh DECIMAL(10, 2) COMMENT 'Số kWh đã sạc trong phiên',
    cost DECIMAL(15, 2) COMMENT 'Chi phí phiên sạc',
    status ENUM('pending', 'charging', 'completed', 'cancelled', 'failed') NOT NULL DEFAULT 'pending' COMMENT 'Trạng thái phiên sạc',
    FOREIGN KEY (electric_vehicle_id) REFERENCES electric_vehicles(id) ON DELETE CASCADE,
    FOREIGN KEY (charging_connector_id) REFERENCES charging_connectors(id) ON DELETE CASCADE
);

-- Transactions Table
CREATE TABLE transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    charging_session_id INT UNIQUE NOT NULL COMMENT 'Phiên sạc tương ứng',
    customer_id INT NOT NULL COMMENT 'Khách hàng thanh toán',
    amount DECIMAL(15, 2) NOT NULL COMMENT 'Số tiền cần thanh toán',
    payment_method ENUM('cash', 'credit_card', 'e_wallet', 'bank_transfer') NOT NULL COMMENT 'Phương thức thanh toán',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') NOT NULL DEFAULT 'pending' COMMENT 'Trạng thái thanh toán',
    bank_name VARCHAR(255) COMMENT 'Tên ngân hàng',
    account_number VARCHAR(50) COMMENT 'Số tài khoản nhận tiền',
    payment_time TIMESTAMP NULL COMMENT 'Thời điểm xác nhận thanh toán',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL COMMENT 'Mặc định now()',
    FOREIGN KEY (charging_session_id) REFERENCES charging_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

-- Prices Table
CREATE TABLE prices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    charging_pole_id INT COMMENT 'Trụ sạc áp dụng giá này',
    name ENUM('phí phạt', 'phí sạc') NOT NULL,
    price DECIMAL(15, 2) COMMENT 'Giá (VNĐ) trên mỗi kWh hoặc mỗi phút đi muộn',
    effective_from DATE NOT NULL COMMENT 'Ngày bắt đầu áp dụng',
    effective_to DATE COMMENT 'Ngày kết thúc (null nếu vẫn còn hiệu lực)',
    start_time TIME NOT NULL COMMENT 'Giờ bắt đầu áp dụng trong ngày',
    end_time TIME NOT NULL COMMENT 'Giờ kết thúc áp dụng trong ngày',
    FOREIGN KEY (charging_pole_id) REFERENCES charging_poles(id) ON DELETE CASCADE
);

-- Rescue Stations Table
CREATE TABLE rescue_stations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    location_id INT NOT NULL COMMENT 'Vị trí của trạm cứu hộ',
    name VARCHAR(255) NOT NULL COMMENT 'Tên trạm cứu hộ',
    phone CHAR(11) NOT NULL COMMENT 'Số điện thoại liên hệ',
    email VARCHAR(255) COMMENT 'Email liên hệ',
    open_time TIME NOT NULL COMMENT 'Giờ bắt đầu hoạt động',
    close_time TIME NOT NULL COMMENT 'Giờ kết thúc hoạt động',
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
);

-- =============================================
-- Sample Data (Optional - for testing)
-- =============================================

-- Insert sample vendors
INSERT INTO vendors (name, email, password, phone, status) VALUES
('VinFast Charging', 'contact@vinfast.vn', '$2a$10$encrypted_password_1', '02412345678', 'active'),
('EVN Charging', 'info@evn.vn', '$2a$10$encrypted_password_2', '02487654321', 'active'),
('Green Energy', 'support@greenenergy.vn', '$2a$10$encrypted_password_3', '02456789012', 'active');

-- Insert sample customers
INSERT INTO customers (name, email, password, phone, status) VALUES
('Nguyễn Văn A', 'nguyenvana@gmail.com', '$2a$10$encrypted_password_4', '0912345678', 'active'),
('Trần Thị B', 'tranthib@gmail.com', '$2a$10$encrypted_password_5', '0987654321', 'active'),
('Lê Văn C', 'levanc@gmail.com', '$2a$10$encrypted_password_6', '0901234567', 'active');

-- Insert sample locations
INSERT INTO locations (latitude, longitude, province, address_detail) VALUES
(21.0285, 105.8542, 'Hà Nội', '123 Đường Láng, Đống Đa'),
(10.7769, 106.7009, 'TP. Hồ Chí Minh', '456 Nguyễn Huệ, Quận 1'),
(16.0544, 108.2022, 'Đà Nẵng', '789 Trần Phú, Hải Châu');

-- Insert sample stations
INSERT INTO stations (vendor_id, location_id, name, open_time, close_time, status, type) VALUES
(1, 1, 'VinFast Station Hà Nội', '06:00:00', '22:00:00', 'active', 'car'),
(2, 2, 'EVN Station Sài Gòn', '00:00:00', '23:59:59', 'active', 'car'),
(3, 3, 'Green Station Đà Nẵng', '07:00:00', '21:00:00', 'active', 'motorbike');

-- Insert sample charging poles
INSERT INTO charging_poles (station_id, manufacturer, max_power, connector_count, install_date) VALUES
(1, 'ABB', 150.00, 2, '2024-01-15'),
(2, 'Schneider', 120.00, 4, '2024-02-20'),
(3, 'Siemens', 50.00, 2, '2024-03-10');

-- Insert sample charging connectors
INSERT INTO charging_connectors (pole_id, connector_type, max_power, status) VALUES
(1, 'CCS', 150.00, 'available'),
(1, 'Type2', 100.00, 'available'),
(2, 'CCS', 120.00, 'in_use'),
(2, 'CHAdeMO', 100.00, 'available'),
(3, 'Type2', 50.00, 'available');

-- Insert sample electric vehicles
INSERT INTO electric_vehicles (customer_id, vehicle_type, brand, model, license_plate, battery_capacity, connector_type) VALUES
(1, 'car', 'VinFast', 'VF8', '30A-12345', 87.70, 'CCS'),
(2, 'car', 'Tesla', 'Model 3', '51G-67890', 75.00, 'Tesla'),
(3, 'motorbike', 'VinFast', 'Klara S', '29X-11111', 3.50, 'Type2');

-- Insert sample rescue stations
INSERT INTO rescue_stations (location_id, name, phone, email, open_time, close_time) VALUES
(1, 'Cứu Hộ Hà Nội 24/7', '1900123456', 'rescue.hn@support.vn', '00:00:00', '23:59:59'),
(2, 'Cứu Hộ Sài Gòn', '1900654321', 'rescue.sg@support.vn', '06:00:00', '22:00:00'),
(3, 'Cứu Hộ Đà Nẵng', '1900789012', 'rescue.dn@support.vn', '07:00:00', '21:00:00');

-- Insert sample charging sessions
INSERT INTO charging_sessions (electric_vehicle_id, charging_connector_id, start_time, end_time, energy_kwh, cost, status) VALUES
(1, 1, '2024-10-20 08:30:00', '2024-10-20 09:45:00', 45.50, 682500, 'completed'),
(1, 1, '2024-10-22 14:15:00', '2024-10-22 15:30:00', 38.20, 573000, 'completed'),
(2, 3, '2024-10-21 10:00:00', '2024-10-21 11:15:00', 52.30, 784500, 'completed'),
(3, 5, '2024-10-23 16:20:00', '2024-10-23 16:50:00', 2.80, 56000, 'completed'),
(1, 2, '2024-10-24 07:00:00', '2024-10-24 08:20:00', 42.10, 631500, 'completed'),
(2, 4, '2024-10-25 09:30:00', NULL, 25.00, NULL, 'charging'),
(3, 5, '2024-10-25 11:00:00', NULL, NULL, NULL, 'pending');

-- Insert sample transactions
INSERT INTO transactions (charging_session_id, customer_id, amount, payment_method, payment_status, bank_name, account_number, payment_time, created_at) VALUES
(1, 1, 682500, 'e_wallet', 'paid', NULL, NULL, '2024-10-20 09:50:00', '2024-10-20 09:45:00'),
(2, 1, 573000, 'credit_card', 'paid', 'Vietcombank', '1234567890', '2024-10-22 15:35:00', '2024-10-22 15:30:00'),
(3, 2, 784500, 'bank_transfer', 'paid', 'BIDV', '9876543210', '2024-10-21 11:20:00', '2024-10-21 11:15:00'),
(4, 3, 56000, 'cash', 'paid', NULL, NULL, '2024-10-23 16:55:00', '2024-10-23 16:50:00'),
(5, 1, 631500, 'e_wallet', 'paid', NULL, NULL, '2024-10-24 08:25:00', '2024-10-24 08:20:00'),
(6, 2, 375000, 'credit_card', 'pending', 'Techcombank', '5555666677', NULL, '2024-10-25 09:30:00'),
(7, 3, 0, 'e_wallet', 'pending', NULL, NULL, NULL, '2024-10-25 11:00:00');

-- Insert sample prices (charging fees)
INSERT INTO prices (charging_pole_id, name, price, effective_from, effective_to, start_time, end_time) VALUES
-- Giá sạc cao điểm cho trụ 1 (ABB)
(1, 'phí sạc', 18000, '2024-01-01', NULL, '06:00:00', '22:00:00'),
(1, 'phí sạc', 12000, '2024-01-01', NULL, '22:00:00', '06:00:00'),
-- Giá sạc cho trụ 2 (Schneider)
(2, 'phí sạc', 17000, '2024-02-01', NULL, '07:00:00', '21:00:00'),
(2, 'phí sạc', 11000, '2024-02-01', NULL, '21:00:00', '07:00:00'),
-- Giá sạc cho trụ 3 (Siemens - xe máy điện)
(3, 'phí sạc', 20000, '2024-03-01', NULL, '08:00:00', '20:00:00'),
(3, 'phí sạc', 15000, '2024-03-01', NULL, '20:00:00', '08:00:00'),
-- Phí phạt đỗ xe quá giờ cho trụ 1
(1, 'phí phạt', 5000, '2024-01-01', NULL, '00:00:00', '23:59:59'),
-- Phí phạt đỗ xe quá giờ cho trụ 2
(2, 'phí phạt', 4000, '2024-02-01', NULL, '00:00:00', '23:59:59'),
-- Phí phạt đỗ xe quá giờ cho trụ 3
(3, 'phí phạt', 3000, '2024-03-01', NULL, '00:00:00', '23:59:59');

-- Insert sample ratings
INSERT INTO ratings (customer_id, target_type, target_id, stars, comment, created_at) VALUES
-- Ratings cho Vendors
(1, 'Vendor', 1, 5, 'Dịch vụ tuyệt vời, trụ sạc nhanh và ổn định. Nhân viên hỗ trợ nhiệt tình.', '2024-10-20 10:00:00'),
(2, 'Vendor', 2, 4, 'Giá cả hợp lý, vị trí thuận tiện. Tuy nhiên đôi khi hơi đông khách.', '2024-10-21 12:00:00'),
(3, 'Vendor', 3, 5, 'Trạm sạc rất sạch sẽ, tiện nghi đầy đủ. Rất hài lòng!', '2024-10-23 17:00:00'),
-- Ratings cho Stations
(1, 'Station', 1, 5, 'Trạm sạc hiện đại, tốc độ sạc rất nhanh. Khu vực chờ thoải mái.', '2024-10-20 10:05:00'),
(2, 'Station', 2, 4, 'Trạm hoạt động 24/7 rất tiện. Tuy nhiên đôi khi app báo sai trạng thái cổng sạc.', '2024-10-21 12:05:00'),
(3, 'Station', 3, 3, 'Vị trí tốt nhưng số lượng cổng sạc còn ít, thường phải chờ đợi.', '2024-10-23 17:05:00'),
(1, 'Station', 2, 5, 'Trạm rất thuận tiện, có cả quán cafe gần đó để ngồi chờ.', '2024-10-24 09:00:00'),
-- Ratings cho Rescue Stations
(2, 'Rescue Station', 1, 5, 'Đội cứu hộ đến rất nhanh, xử lý chuyên nghiệp. Giá cả hợp lý.', '2024-10-22 16:00:00'),
(1, 'Rescue Station', 2, 4, 'Nhân viên thân thiện, hỗ trợ tốt. Thời gian chờ hơi lâu do xa.', '2024-10-19 14:30:00'),
(3, 'Rescue Station', 3, 5, 'Dịch vụ cứu hộ xuất sắc! Giải quyết vấn đề nhanh chóng.', '2024-10-18 11:00:00');

-- =============================================
-- End of Script
-- =============================================