# Tennis Club Ranking — Frontend

React + TypeScript + Vite frontend for the [tennis club ranking backend](https://github.com/KWTC-Ranking/Backend).

## Stack

- Vite + React 19 + TypeScript
- React Router
- Plain `fetch` (no client library) via a small wrapper in `src/api/`
- ESLint + Prettier

## Running locally

The backend must be running first (see the backend repo's README —
`docker compose up -d` + `./gradlew bootRun`, API at `http://localhost:8080`). Its CORS config
already allows `http://localhost:5173`, Vite's default dev port.

```
npm install
npm run dev
```

If your backend runs somewhere other than `http://localhost:8080`, copy `.env.example` to
`.env.local` and set `VITE_API_BASE_URL`.

## Scripts

- `npm run dev` — dev server
- `npm run build` — typecheck (`tsc -b`) + production build
- `npm run lint` — ESLint
- `npm run format` — Prettier, writes in place

## Structure

```
src/
  api/           fetch wrapper + typed calls (auth, leaderboard, ...) + shared DTO types
  context/       auth state (AuthProvider/useAuth), token persisted in localStorage
  routes/        page components (LoginPage, LeaderboardPage, ProtectedRoute)
  App.tsx        router setup
```

## Auth

JWT bearer auth against the backend. `POST /api/auth/login` returns a token, stored in
`localStorage` and attached as `Authorization: Bearer <token>` on every subsequent request by
`src/api/client.ts`. Two roles: `ADMIN` and `MEMBER` — gate admin-only UI behind
`user.role === "ADMIN"`.

## Status

Scaffold only, so far: login screen + a working singles/doubles leaderboard view, wired end-to-end
against the real backend. Everything else (match recording, admin screens, player profile/point
history) is not built yet — see the full API reference and suggested build order in the handoff
brief from the initial project setup.
