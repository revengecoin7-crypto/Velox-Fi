# VeloxFi — Memecoin Battle Platform

## Overview

Dark-themed memecoin battle platform. Users pick two coins from the top 10 most volatile memecoins (via CoinGecko), choose a timeframe (5/15/30 min), and predict which coin gains the most % from entry price. Earn $BATTLE tokens: 1/2/3 for 5/15/30 min wins. Free-to-play, localStorage auth, live prices via server-side API proxy. pnpm workspace monorepo using TypeScript.

## VeloxFi App (`artifacts/veloxfi`)

Single `index.html` SPA (served by Vite). Key features:
- **Main page**: hero section, 2-column pick grids (5 coins each), timeframe selector (5/15/30 min with reward labels), selected coin display, start battle button, active battles tracker, leaderboard
- **Battle page** (URL: `?coinA=<id>&coinB=<id>&time=<secs>`): MK-style health bar with `battle-bar.jpg` background + animated ⚡ bolt; two stat cards (price, % change since entry, 24h vol, market cap); Chart.js mini line charts (price history, updated every 10s); live countdown timer; result card with PLAY AGAIN
- **Price data**: `/api/prices` returns USD price + 24h change + 24h vol + market cap (CoinGecko simple/price, 60s cache)
- **Auth**: localStorage (`vfx_users`, `vfx_session`); free registration; $BATTLE token balance stored per user
- **TIMEFRAME_REWARDS**: `{300:1, 900:2, 1800:3}` (seconds → tokens)

## Key Files

- `artifacts/veloxfi/index.html` — entire app (HTML + CSS + JS, Orbitron/Rajdhani fonts, Chart.js CDN)
- `artifacts/veloxfi/public/battle-bar.jpg` — MK health bar background image
- `artifacts/api-server/src/routes/prices.ts` — CoinGecko proxy (includes vol + mktcap)
- `artifacts/api-server/src/routes/memecoins.ts` — top 10 volatile memecoins

## Design Tokens

`--bg:#05080f`, `--blue:#2563eb`, `--blue-glow:#3b82f6`, `--purple:#7c3aed`, `--purple-glow:#a855f7`, `--green:#10b981`, `--red:#ef4444`, `--gold:#f59e0b`; fonts: Orbitron (headings), Rajdhani (body)

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   └── api-server/         # Express API server
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts (single workspace package)
│   └── src/                # Individual .ts scripts, run via `pnpm --filter @workspace/scripts run <script>`
├── pnpm-workspace.yaml     # pnpm workspace (artifacts/*, lib/*, lib/integrations/*, scripts)
├── tsconfig.base.json      # Shared TS options (composite, bundler resolution, es2022)
├── tsconfig.json           # Root TS project references
└── package.json            # Root package with hoisted devDeps
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references. This means:

- **Always typecheck from the root** — run `pnpm run typecheck` (which runs `tsc --build --emitDeclarationOnly`). This builds the full dependency graph so that cross-package imports resolve correctly. Running `tsc` inside a single package will fail if its dependencies haven't been built yet.
- **`emitDeclarationOnly`** — we only emit `.d.ts` files during typecheck; actual JS bundling is handled by esbuild/tsx/vite...etc, not `tsc`.
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array. `tsc --build` uses this to determine build order and skip up-to-date packages.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server. Routes live in `src/routes/` and use `@workspace/api-zod` for request and response validation and `@workspace/db` for persistence.

- Entry: `src/index.ts` — reads `PORT`, starts Express
- App setup: `src/app.ts` — mounts CORS, JSON/urlencoded parsing, routes at `/api`
- Routes: `src/routes/index.ts` mounts sub-routers; `src/routes/health.ts` exposes `GET /health` (full path: `/api/health`)
- Depends on: `@workspace/db`, `@workspace/api-zod`
- `pnpm --filter @workspace/api-server run dev` — run the dev server
- `pnpm --filter @workspace/api-server run build` — production esbuild bundle (`dist/index.cjs`)
- Build bundles an allowlist of deps (express, cors, pg, drizzle-orm, zod, etc.) and externalizes the rest

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL. Exports a Drizzle client instance and schema models.

- `src/index.ts` — creates a `Pool` + Drizzle instance, exports schema
- `src/schema/index.ts` — barrel re-export of all models
- `src/schema/<modelname>.ts` — table definitions with `drizzle-zod` insert schemas (no models definitions exist right now)
- `drizzle.config.ts` — Drizzle Kit config (requires `DATABASE_URL`, automatically provided by Replit)
- Exports: `.` (pool, db, schema), `./schema` (schema only)

Production migrations are handled by Replit when publishing. In development, we just use `pnpm --filter @workspace/db run push`, and we fallback to `pnpm --filter @workspace/db run push-force`.

### `lib/api-spec` (`@workspace/api-spec`)

Owns the OpenAPI 3.1 spec (`openapi.yaml`) and the Orval config (`orval.config.ts`). Running codegen produces output into two sibling packages:

1. `lib/api-client-react/src/generated/` — React Query hooks + fetch client
2. `lib/api-zod/src/generated/` — Zod schemas

Run codegen: `pnpm --filter @workspace/api-spec run codegen`

### `lib/api-zod` (`@workspace/api-zod`)

Generated Zod schemas from the OpenAPI spec (e.g. `HealthCheckResponse`). Used by `api-server` for response validation.

### `lib/api-client-react` (`@workspace/api-client-react`)

Generated React Query hooks and fetch client from the OpenAPI spec (e.g. `useHealthCheck`, `healthCheck`).

### `scripts` (`@workspace/scripts`)

Utility scripts package. Each script is a `.ts` file in `src/` with a corresponding npm script in `package.json`. Run scripts via `pnpm --filter @workspace/scripts run <script>`. Scripts can import any workspace package (e.g., `@workspace/db`) by adding it as a dependency in `scripts/package.json`.
