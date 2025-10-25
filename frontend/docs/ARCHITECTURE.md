# Architecture & Technical Reference

## System Architecture

```
┌─────────────────────────────────────────┐
│         Client (Next.js 15)             │
│  App Router → Components → Redux        │
└──────────────┬──────────────────────────┘
               ↓ HTTP/REST
┌──────────────────────────────────────────┐
│      Supabase (Auth + PostgreSQL)        │
└──────────────┬───────────────────────────┘
               ↓
┌──────────────────────────────────────────┐
│  External APIs (Mapbox, OSRM, Goong)    │
└──────────────────────────────────────────┘
```

## Core Modules

### 1. Authentication (`app/login`, `lib/redux/services/auth.ts`)
- Supabase Auth (email/password, OAuth)
- JWT session management
- RTK Query mutations: `useLoginMutation`, `useSignupMutation`

### 2. User Profile (`app/profile`, `lib/redux/services/profileApi.ts`)
- Profile CRUD, avatar upload
- Projects management (instance_data, solution_data as JSONB)
- Notifications system

### 3. Routing (`components/routing/RoutingMap.tsx`)
**2300 lines** - Main routing interface
- Mapbox GL map với interactive waypoints
- Route calculation: Mapbox Directions API / OSRM
- Turn-by-turn navigation với maneuver instructions
- Vehicle simulation với animation
- Traffic visualization (congestion levels)
- Station/POI filtering

Key state:
```typescript
waypoints: { lat, lng, name }[]
routes: MapRoute[]  // từ Mapbox API
selectedRoute, isSimulating, showTraffic
```

### 4. Instance Builder (`components/add-instance/AddInstanceBuilder.tsx`)
**1300 lines** - VRP instance creator
- Interactive map để add nodes (depot, customers, pickup/delivery)
- Time matrix generation (OSRM Distance Matrix API)
- Node editor với constraints (demand, time_window, duration)
- Export/import .txt format

### 5. Map Visualization (`components/map/MapComponent.tsx`)
**860 lines** - Solution viewer
- Leaflet map display Instance + Solution
- Route highlighting, node selection
- Real routing toggle (straight lines ↔ OSRM routes)

## Data Models

```typescript
// VRP Data (utils/dataModels.ts)
interface Instance {
  nodes: Node[];
  times: number[][];  // Travel time matrix (seconds)
  capacity: number;
  name, type, size, location;
}

interface Node {
  id: number;          // 0 = depot
  coords: [lat, lng];
  demand: number;
  time_window: [earliest, latest];  // minutes
  duration: number;    // service time
  is_depot, is_pickup, is_delivery;
  pair: number;        // linked node ID
}

interface Solution {
  routes: Route[];
}

interface Route {
  sequence: number[];  // ordered node IDs
  path: [lat, lng][];
  color: string;
  cost: number;
}
```

## Services & APIs

### Geocoding (`services/geocoding.ts`)
Providers: Mapbox, Nominatim, OpenCage, Google, Goong
```typescript
getGeocoder().suggest(query) → Suggestion[]
getGeocoder().reverse(lng, lat) → address
```

### RTK Query APIs
```typescript
// authApi
useLoginMutation()
useGetSessionQuery()

// profileApi
useGetProfileOverviewQuery(userId)
useUpdateProfileMutation()
useUploadAvatarMutation()

// Projects
useGetProjectsQuery({ userId, status, page, limit })
useCreateProjectMutation()
```

### External APIs
- **Mapbox Directions**: Route calculation với traffic
- **OSRM**: Free routing, distance matrix
- **Goong**: Vietnam-specific geocoding

## Database Schema (Supabase)

```sql
-- profiles
id (uuid, PK → auth.users)
username, full_name, avatar_url, bio
role (customer | supplier | tech)

-- projects
id, user_id
name, description
instance_data (jsonb)   -- Instance object
solution_data (jsonb)   -- Solution object
status (draft | published | archived)

-- notifications
id, user_id, type, title, content, is_read
```

## Common Patterns

**Dynamic Import (SSR fix):**
```tsx
const Map = dynamic(() => import('./MapComponent'), { ssr: false });
```

**RTK Query Cache:**
```typescript
// Define tags
tagTypes: ['Profile', 'Projects']

// Provide tags
getProfile: builder.query({
  providesTags: ['Profile']
})

// Invalidate on mutation
updateProfile: builder.mutation({
  invalidatesTags: ['Profile']
})
```

**Config từ env:**
```typescript
// config/config.ts
export default {
  api: { baseURL: process.env.NEXT_PUBLIC_API_URL },
  mapbox: { accessToken: process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN },
  defaultParams: { /* ACO params */ }
}
```

## Performance Notes

- Code splitting: Map components loaded dynamically
- Memoization: `useMemo`, `useCallback` cho expensive operations
- Debouncing: Map events, search inputs
- Caching: RTK Query auto-cache API responses
- Routing cache: localStorage cho OSRM routes

## Sơ đồ kiến trúc tổng quan

