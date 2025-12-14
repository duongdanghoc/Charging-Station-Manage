# ⚡ Charging Station Management System

Fullstack application gồm:
- **Backend**: Spring Boot (Java 17, PostgreSQL)
- **Frontend**: Next.js 15 (React 19, SSR)
- **Infrastructure**: Docker & Docker Compose

---

## 📁 1. Cấu trúc dự án

```txt
charging-station-management/
│
├─ docker-compose.yml          # Chạy toàn bộ hệ thống (FE + BE + DB)
├─ .env                        # Biến môi trường (không commit secret)
│
├─ backend/
│  ├─ Dockerfile
│  ├─ .dockerignore
│  ├─ pom.xml
│  └─ src/
│     └─ main/
│        └─ resources/
│           ├─ application.properties
│           └─ application-docker.properties
│
├─ frontend/
│  ├─ Dockerfile
│  ├─ .dockerignore
│  ├─ package.json
│  ├─ next.config.js
│  ├─ app/
│  ├─ public/
│  └─ ...
│
└─ README.md
🐳 2. Cách chạy bằng Docker
Yêu cầu
Docker Desktop (Windows / macOS / Linux)

Docker Compose v2+

Bước chạy
bash
Sao chép mã
# 1. Clone project
git clone <repository-url>
cd charging-station-management

# 2. Tạo file môi trường
cp .env.example .env   # nếu có
# hoặc tạo mới .env

# 3. Build & chạy toàn bộ hệ thống
docker compose up --build
Truy cập
Service	URL
Frontend	http://localhost:3000
Backend	http://localhost:8080
PostgreSQL	localhost:5432

📌 Tài khoản admin mặc định:

makefile
Sao chép mã
Email: admin@wayo.com
Password: 123456
⚙️ 3. Cấu hình khi người khác chạy (branch / máy khác)
1️⃣ Docker Desktop
BẮT BUỘC mở Docker Desktop trước khi chạy

Kiểm tra bằng:

bash
Sao chép mã
docker info
2️⃣ File .env (KHÔNG commit)
Người khác cần tự tạo file .env tại thư mục root:

env
Sao chép mã
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8080

# Backend (Email)
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password
📌 Không push .env lên git.

3️⃣ Không sửa localhost trong Docker
Backend đã dùng:

bash
Sao chép mã
jdbc:postgresql://postgres:5432/charging_station_db
Không đổi thành localhost

4️⃣ Khi đổi code
Chạy lại:

bash
Sao chép mã
docker compose up --build
5️⃣ Dừng hệ thống
bash
Sao chép mã
docker compose down
✅ Ghi chú
Dữ liệu PostgreSQL được lưu bằng Docker volume → không mất khi restart

Upload file được mount volume /app/uploads

Frontend chạy ở chế độ production (next build + next start)
