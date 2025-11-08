# WAYO - Agent Coding Guide

Documentation tối ưu cho AI agents để hiểu nhanh source code.

## Project Structure

```
src/
├── app/              # Next.js pages (App Router)
│   ├── login/register/profile/  # Auth & user pages
│   ├── map/routing/           # Map interfaces
│   ├── add-instance/          # VRP instance builder
│   └── api/                   # API routes
├── components/       # React components
│   ├── ui/          # shadcn/ui primitives
│   ├── routing/     # RoutingMap (Mapbox GL)
│   ├── map/         # MapComponent (Leaflet)
│   ├── add-instance/  # Instance builder
│   └── profile/     # User profile
├── lib/redux/       # Redux store + RTK Query
├── services/        # External APIs (geocoding, routing)
├── utils/          # dataModels.ts (Instance, Node, Route)
└── config/         # App configuration
```

## Architecture

**Stack:** Next.js 15 + React 19 + TypeScript + Tailwind CSS 4 + Supabase + Redux Toolkit

**Key Flows:**
- Auth: Supabase Auth → RTK Query → Redux cache
- Routing: Waypoints → Mapbox/OSRM API → GeoJSON → Map rendering
- VRP: Instance → ACO algorithm → Solution → Visualization

## Core Data Models

```typescript
// VRP Problem (src/utils/dataModels.ts)
interface Instance {
  nodes: Node[];
  times: number[][];  // Distance matrix
  capacity: number;
}

interface Node {
  id: number;
  coords: [number, number];
  demand: number;
  time_window: [number, number];
  is_depot: boolean;
}

interface Solution {
  routes: Route[];
}

interface Route {
  sequence: number[];  // Node IDs
  path: [number, number][];
}
```

## Key Components

**RoutingMap** (`components/routing/RoutingMap.tsx`, 2300 lines)
- Mapbox GL interactive map
- Waypoint management, route calculation, turn-by-turn navigation
- Vehicle simulation, traffic visualization

**AddInstanceBuilder** (`components/add-instance/AddInstanceBuilder.tsx`, 1300 lines)
- VRP instance creator với interactive map
- Node editor, time matrix generation, import/export

**MapComponent** (`components/map/MapComponent.tsx`, 860 lines)
- Leaflet map cho visualization
- Display instances/solutions, route selection

## 🔌 APIs & Services

**RTK Query APIs** (`lib/redux/services/`)
- `authApi`: login, signup, session
- `profileApi`: profile CRUD, projects, avatar upload
- `adminApi`: checkAdmin

**External Services** (`services/`)
- `geocoding.ts`: Mapbox/Nominatim/Goong/Google geocoding
- `backendClient.js`: Supabase API wrapper
- OSRM: Routing & distance matrix

## Key Features

1. **VRP Optimization**: ACO algorithm (see ROUTING_ALGORITHMS.md)
2. **Real-time Routing**: Mapbox Directions API với traffic
3. **Interactive Builder**: Drag-drop nodes, generate time matrix
4. **User System**: Supabase auth, profiles, projects storage

## Development Tips

**SSR Issues with Maps:**
```tsx
const Map = dynamic(() => import('./MapComponent'), { ssr: false });
```

**Environment Variables:**
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=  # Optional
```

**Common Patterns:**
- State: Redux Toolkit + RTK Query
- Forms: React Hook Form + Zod
- Styling: Tailwind utility classes
- Maps: Dynamic imports to avoid SSR

## Quick Fixes

| Issue | Solution |
|-------|----------|
| `window is not defined` | Use `dynamic` import with `ssr: false` |
| Hydration error | Use `useEffect` for client-only state |
| Cache not updating | Add `invalidatesTags` to mutation |

## Read More

- **ARCHITECTURE.md**: Detailed system architecture & data flows
- **ROUTING_ALGORITHMS.md**: ACO algorithm implementation
- Full docs in other .md files if needed