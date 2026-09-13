# Plan: Connect Frontend to Backend

## Steps
- [x] 1. Create `next.config.ts` rewrite so `/api/*` proxies to `http://localhost:8000/*`
- [x] 2. Update `frontend/app/login/page.tsx` to POST to `/api/login` and redirect to `/dashboard` on success
- [x] 3. Update `frontend/app/signup/page.tsx` to POST to `/api/signup` and redirect to `/login` on success
- [x] 4. Update `frontend/app/dashboard/page.tsx` to display user first name and add logout
- [x] 5. Verify backend and frontend run correctly

---

# Plan: Premium 3D Animated Background

## Steps
- [x] 1. Install `three`, `@react-three/fiber`, `@react-three/drei`, `framer-motion`, `@types/three`
- [x] 2. Create reusable `frontend/components/Background3D.tsx` (low-poly farm, AI holograms, particles, network, weather, globe, camera rig)
- [x] 3. Integrate `Background3D` into `login/page.tsx` with glassmorphism dark-futuristic card
- [x] 4. Integrate `Background3D` into `signup/page.tsx` with glassmorphism dark-futuristic card
- [x] 5. Verify frontend compiles and serves on `/login` and `/signup`

# Plan: Cinematic Futuristic 3D Background (Enhanced)

## Steps
- [x] 1. Add flowing neon energy lines through farmland (`EnergyLines`)
- [x] 2. Add floating holographic agricultural data panels (`DataPanel`)
- [x] 3. Add AI network particles connecting crops and fields (`AINetwork`)
- [x] 4. Add satellite signals and digital farming holograms (`SatelliteSignals`)
- [x] 5. Add subtle holographic Earth in background (`HolographicEarth`)
- [x] 6. Add robotic farming drone technology (`RoboticDrone`)
- [x] 7. Enhance cinematic lighting, depth of field, and 16:9 composition
- [x] 8. Verify `/login` and `/signup` serve correctly (HTTP 200)
