# WAYO - Vehicle Routing & Mapping Platform

> **Documentation**: See [`./docs/INDEX.md`](./docs/INDEX.md) for comprehensive codebase documentation.

## Mô tả dự án

**WAYO** là một nền tảng quản lý logistics và tối ưu hóa tuyến đường thông minh, được xây dựng trên Next.js 15. Hệ thống cung cấp các tính năng tối ưu hóa tuyến đường sử dụng thuật toán Ant Colony Optimization (ACO), quản lý bản đồ tương tác với nhiều thư viện mapping khác nhau (Mapbox, Leaflet, TrackAsia), và hệ thống quản lý người dùng với xác thực đầy đủ.

### Mục tiêu chính

1. **Tối ưu hóa tuyến đường**: Giải quyết bài toán Vehicle Routing Problem (VRP) với các ràng buộc về thời gian, sức chứa xe, time windows
2. **Quản lý Instance**: Cho phép người dùng tạo, chỉnh sửa, và quản lý các instance routing với nodes, time matrix, và các ràng buộc
3. **Hệ thống Mapping đa nền tảng**: Tích hợp Mapbox, Leaflet, TrackAsia GL để hiển thị và tương tác với bản đồ
4. **Quản lý Profile & Projects**: Hệ thống người dùng đầy đủ với profile, projects, notifications
5. **Real-time Routing**: Tính toán và hiển thị tuyến đường thời gian thực với traffic data
6. **Simulation & Guidance**: Mô phỏng xe chạy trên tuyến đường với turn-by-turn navigation

## Tech Stack

### Frontend Framework
- **Next.js 15.2.4** - React framework với App Router
- **React 19** - UI library
- **TypeScript 5** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework

### State Management & Data Fetching
- **Redux Toolkit 2.7** - State management
- **RTK Query** - Data fetching và caching
- **React Redux 9.2** - React bindings for Redux

### Mapping & Geospatial
- **Mapbox GL 3.15** - Interactive vector maps
- **Leaflet 1.9** - Open-source mapping library
- **React Leaflet 5.0** - React components for Leaflet
- **TrackAsia GL 2.0** - Alternative mapping solution
- **Nominatim Client** - Geocoding service
- **OSRM Client** - Routing service

### UI Components & Utilities
- **Radix UI** - Unstyled, accessible component primitives
- **Lucide React** - Icon library
- **Tiptap** - Rich text editor
- **React Hook Form** - Form management
- **Zod** - Schema validation
- **date-fns** - Date utility library
- **Sonner** - Toast notifications
- **@dnd-kit** - Drag and drop functionality

### Backend & Database
- **Supabase** - Backend as a Service (Authentication, Database, Storage)
- **PostgreSQL** (via Supabase) - Relational database

## Cấu trúc dự án

```
Web20251/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/                  # API routes
│   │   │   └── admin/           # Admin API endpoints
│   │   ├── login/               # Login page
│   │   ├── signup/              # Signup page
│   │   ├── profile/             # User profile page
│   │   ├── map/                 # Main map interface
│   │   ├── routing/             # Routing page
│   │   ├── add-instance/        # Instance builder
│   │   ├── route-details/       # Route details view
│   │   └── layout.tsx           # Root layout
│   ├── components/              # React components
│   │   ├── routing/            # Routing-related components
│   │   ├── map/                # Map components
│   │   ├── profile/            # Profile components
│   │   ├── add-instance/       # Instance builder components
│   │   ├── route-details/      # Route detail components
│   │   ├── common/             # Shared components
│   │   └── ui/                 # UI primitives (shadcn/ui)
│   ├── lib/                     # Utilities & libraries
│   │   ├── redux/              # Redux store & slices
│   │   │   ├── services/       # RTK Query API services
│   │   │   ├── store.ts        # Redux store config
│   │   │   └── provider.tsx    # Redux provider
│   │   ├── hooks/              # Custom React hooks
│   │   ├── constants/          # Constants & enums
│   │   └── utils.ts            # Utility functions
│   ├── services/                # External services
│   │   ├── backendClient.js    # Backend API client
│   │   ├── geocoding.ts        # Geocoding services
│   │   ├── TrackAsiaService.js # TrackAsia integration
│   │   └── TrafficAPIService.js # Traffic data service
│   ├── config/                  # Configuration files
│   │   ├── config.ts           # App configuration
│   │   └── mapLinks.ts         # Map navigation links
│   ├── utils/                   # Utility functions
│   │   ├── dataModels.ts       # Data type definitions
│   │   ├── debug.js            # Debug utilities
│   │   └── TrackAsiaLoader.js  # Map loader
│   ├── hooks/                   # Custom React hooks
│   │   ├── useFileReader.ts    # File reading hook
│   │   ├── useMapControls.ts   # Map controls hook
│   │   └── useScrollDirection.ts # Scroll detection
│   ├── supabase/               # Supabase integration
│   │   └── client.ts           # Supabase client
│   ├── styles/                 # Global styles
│   └── data/                   # Sample data
├── public/                      # Static assets
├── docs/                        # Documentation
├── package.json                 # Dependencies
├── next.config.ts              # Next.js config
├── tsconfig.json               # TypeScript config
├── postcss.config.mjs          # PostCSS config
└── components.json             # Shadcn UI config
```

## Cách chạy dự án

### Prerequisites

- **Node.js** >= 18.x
- **npm** hoặc **yarn** hoặc **pnpm**
- **Supabase account** (để có database và authentication)
- **Mapbox Access Token** (optional, cho Mapbox features)

### Bước 1: Cài đặt dependencies

```bash
npm install
# hoặc
yarn install
# hoặc
pnpm install
```

### Bước 2: Cấu hình environment variables

Tạo file `.env.local` trong thư mục root với nội dung:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Mapbox (optional)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token
NEXT_PUBLIC_MAPBOX_STYLE=mapbox://styles/mapbox/streets-v12

# Map Configuration
NEXT_PUBLIC_MAP_TILE_URL=https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
NEXT_PUBLIC_DEFAULT_CENTER_LAT=21.0227
NEXT_PUBLIC_DEFAULT_CENTER_LNG=105.8194
NEXT_PUBLIC_DEFAULT_ZOOM=12

# Geocoding
NEXT_PUBLIC_GEOCODING_PROVIDER=goong
NEXT_PUBLIC_GOONG_API_KEY=your_goong_key

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_API_BASE_PATH=/api

# Branding
NEXT_PUBLIC_LOGO_WAYO=/favicon.svg

# Algorithm Parameters
NEXT_PUBLIC_DEFAULT_NUM_ROUTES=7
NEXT_PUBLIC_DEFAULT_ANTS=10
NEXT_PUBLIC_DEFAULT_ITERATIONS=20
NEXT_PUBLIC_DEFAULT_ALPHA=2.0
NEXT_PUBLIC_DEFAULT_BETA=5.0
NEXT_PUBLIC_DEFAULT_RHO=0.1
NEXT_PUBLIC_DEFAULT_TAU_MAX=50.0
NEXT_PUBLIC_DEFAULT_TAU_MIN=0.01
NEXT_PUBLIC_DEFAULT_GREEDY_BIAS=0.85
NEXT_PUBLIC_DEFAULT_ELITE_SOLUTIONS=4
NEXT_PUBLIC_DEFAULT_LOCAL_SEARCH_PROB=0.7
NEXT_PUBLIC_DEFAULT_RESTART_THRESHOLD=2
```

### Bước 3: Setup Supabase Database

1. Tạo project trên [Supabase](https://supabase.com)
2. Chạy migrations để tạo tables (profiles, projects, notifications, etc.)
3. Copy URL và anon key vào `.env.local`

### Bước 4: Chạy development server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000) trong browser.

### Bước 5: Build cho production

```bash
npm run build
npm run start
```