# Routing Algorithms

## Vehicle Routing Problem (VRP)

**Goal:** Tìm tập routes tối ưu cho fleet xe để serve customers với constraints.

**Variants:**
- **CVRP**: Capacitated (mỗi xe có giới hạn capacity)
- **VRPTW**: Time Windows (customer có [earliest, latest])
- **VRPPD**: Pickup & Delivery (pickup before delivery)

## Ant Colony Optimization (ACO)

Meta-heuristic algorithm lấy cảm hứng từ kiến tìm thức ăn.

### Core Concepts

**Pheromone:** τ_ij trên edge (i,j) - càng cao → càng hấp dẫn  
**Heuristic:** η_ij = 1/distance_ij - ưu tiên edges gần

**Probability Rule:**
```
P_ij = [τ_ij^α × η_ij^β] / Σ[τ_il^α × η_il^β]
```

### Algorithm Flow

```typescript
function ACO(instance, params) {
  let pheromone = initPheromone(params.tau_max);
  let bestSolution = null;
  
  for (iter = 0; iter < params.iterations; iter++) {
    // 1. Construct solutions (all ants)
    solutions = [];
    for (ant = 0; ant < params.ants; ant++) {
      solutions.push(constructSolution(instance, pheromone, params));
    }
    
    // 2. Optional local search
    if (random() < params.local_search_prob) {
      solutions.forEach(s => twoOpt(s));
    }
    
    // 3. Update best
    iterBest = getBestSolution(solutions);
    if (iterBest.cost < bestSolution?.cost) {
      bestSolution = iterBest;
    }
    
    // 4. Update pheromone
    evaporate(pheromone, params.rho);
    depositPheromone(pheromone, getEliteSolutions(solutions));
  }
  
  return bestSolution;
}
```

### Solution Construction

```typescript
function constructSolution(instance, pheromone, params) {
  routes = [];
  unvisited = Set(all_customers);
  
  while (unvisited.size > 0) {
    route = [depot];
    current = depot;
    capacity = params.capacity;
    
    while (unvisited.size > 0) {
      // Select next node probabilistically
      next = selectNext(current, unvisited, pheromone, params);
      if (!next || !feasible(next, capacity)) break;
      
      route.push(next);
      unvisited.delete(next);
      capacity -= next.demand;
      current = next;
    }
    
    route.push(depot);
    routes.push(route);
  }
  
  return new Solution(routes);
}

function selectNext(current, candidates, pheromone, params) {
  // Greedy bias
  if (random() < params.greedy_bias) {
    return getBest(candidates);
  }
  
  // Roulette wheel selection
  probs = candidates.map(node => 
    pow(pheromone[current][node], params.alpha) *
    pow(1/distance[current][node], params.beta)
  );
  
  return rouletteWheel(candidates, probs);
}
```

### Pheromone Update

```typescript
// Evaporation
τ_ij ← (1 - ρ) × τ_ij

// Deposit by elite solutions
for (route in eliteSolutions) {
  for (edge in route) {
    τ_edge += 1 / route.cost
  }
}

// Bound: τ_min ≤ τ_ij ≤ τ_max
```

### Local Search: 2-opt

```typescript
function twoOpt(route) {
  improved = true;
  while (improved) {
    improved = false;
    for (i = 1; i < route.length - 2; i++) {
      for (j = i + 1; j < route.length - 1; j++) {
        newRoute = reverse(route, i, j);
        if (newRoute.cost < route.cost) {
          route = newRoute;
          improved = true;
        }
      }
    }
  }
}
```

### Parameters

```typescript
interface ACOParams {
  ants: number;          // Solutions per iteration (default: 10)
  iterations: number;    // (default: 20)
  alpha: number;         // Pheromone importance (default: 2.0)
  beta: number;          // Heuristic importance (default: 5.0)
  rho: number;           // Evaporation rate (default: 0.1)
  tau_max: number;       // Max pheromone (default: 50.0)
  tau_min: number;       // Min pheromone (default: 0.01)
  greedy_bias: number;   // Greedy probability (default: 0.85)
  elite_solutions: number;  // For pheromone update (default: 4)
  local_search_prob: number; // (default: 0.7)
}
```

## Real-time Routing APIs

### Mapbox Directions

```typescript
const coords = waypoints.map(w => `${w.lng},${w.lat}`).join(';');
const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?access_token=${token}&geometries=geojson&steps=true`;
const data = await fetch(url).then(r => r.json());
// Returns: routes[0].geometry, legs[], steps[]
```

### OSRM

```typescript
// Routing
const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;

// Distance Matrix
const url = `https://router.project-osrm.org/table/v1/driving/${coords}?annotations=duration`;
// Returns: durations[][] (seconds)
```

## Other Heuristics

**Nearest Neighbor:** O(n²)
```typescript
while (unvisited.size > 0) {
  nearest = min(unvisited, node => distance[current][node]);
  route.push(nearest);
  unvisited.delete(nearest);
  current = nearest;
}
```

**Savings Algorithm:** O(n² log n)
```
1. Calculate savings s_ij = d_0i + d_0j - d_ij
2. Sort savings descending
3. Merge routes based on savings if feasible
```

## Validation

```typescript
function validate(solution, instance) {
  for (route of solution.routes) {
    // Capacity
    totalDemand = sum(route.nodes.map(n => n.demand));
    if (totalDemand > instance.capacity) return false;
    
    // Time windows
    time = 0;
    for (node of route.nodes) {
      time += travelTime + node.duration;
      if (time > node.time_window[1]) return false;
    }
  }
  return true;
}
```

## Implementation Files

- **ACO Core**: `src/lib/redux/slices/routingSlice.ts` - ACO algorithm implementation
- **UI**: `src/app/routing/page.tsx` - RoutingMap component (2300 lines)
- **Instance Builder**: `src/components/add-instance/AddInstanceBuilder.tsx` (1300 lines)
- **APIs**: `src/services/geocoding.ts`, `TrackAsiaService.js`, `TrafficAPIService.js`