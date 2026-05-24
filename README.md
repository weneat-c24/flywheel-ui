# Flywheel UI — Voice AI Observability Copilot

A single-page application for monitoring, debugging, and improving voice AI agents in production. Built as an interview assignment demonstrating end-to-end ownership across product, design, engineering, and QA.

**Live demo:** [https://weneat-c24.github.io/flywheel-ui/?mock=true](https://weneat-c24.github.io/flywheel-ui/?mock=true)

---

## Architecture

### Stack

| Layer | Technology |
|---|---|
| Framework | Vue 3 (Composition API + `<script setup>`) |
| Build | Vite 8 + TypeScript 6 |
| Routing | Vue Router 4 — `createWebHashHistory` (hash-based, no server rewrites needed) |
| Data fetching | TanStack Vue Query 5 (caching, loading/error states, background refetch) |
| Charts | ECharts 6 via vue-echarts |
| Styling | Plain CSS with design tokens (`src/styles/`) |
| Deployment | GitHub Pages via `peaceiris/actions-gh-pages` |

### Folder structure

```
src/
├── api/
│   ├── client.ts          # apiFetch — real fetch or mock resolver
│   ├── mockResolver.ts    # In-process fixture router (no service worker)
│   └── types.ts           # All domain types (Agent, Session, Kpi, …)
├── composables/
│   ├── useAgentContext.ts  # Shared agent query / route param
│   ├── useSSE.ts           # Live event stream (real EventSource or MockSSEFeed)
│   ├── useFormatters.ts    # Date / duration helpers
│   └── useUiState.ts       # Lightweight local UI state
├── mocks/
│   └── fixtures/           # Static JSON-like fixture data for every API route
├── router/                 # Route definitions
├── screens/
│   ├── OverviewScreen.vue  # Multi-agent dashboard
│   ├── AgentsListScreen.vue
│   ├── AgentDetailScreen.vue  # Container — renders active tab
│   ├── MonitorScreen.vue      # Live event stream + query panel
│   ├── GhlPanelScreen.vue     # GHL integration panel
│   ├── SettingsScreen.vue     # Ingestion configuration
│   └── tabs/               # Tab components inside AgentDetailScreen
│       ├── DashboardTab.vue
│       ├── SessionsTab.vue
│       ├── SessionDetailTab.vue
│       ├── KpisTab.vue
│       ├── ToolReliabilityTab.vue
│       ├── RecommendationsTab.vue
│       ├── VersionsTab.vue
│       └── ConfigTab.vue
├── components/             # Reusable primitives (Pill, Badge, Sparkline, …)
├── styles/                 # Global CSS + design tokens
└── utils/
    └── mockMode.ts         # URL-flag → sessionStorage → env var resolution
```

### Data flow

```
URL param (?mock=true/false)
    ↓ isMockMode()
    ├── mock=true  → apiFetch → mockResolver.ts → fixture data (in-process, no network)
    └── mock=false → apiFetch → fetch /api/*      → real backend
```

Vue Query sits above `apiFetch` and handles caching, stale-while-revalidate, and loading/error states for every screen. The mock resolver simulates realistic network latency (80–250 ms) so loading states are exercised in mock mode.

---

## Mock flag

Append `?mock=true` or `?mock=false` to any URL to switch modes. The value is written to `sessionStorage` so it persists through in-app navigation without staying in the URL bar.

Priority order: `?mock` URL param → `sessionStorage` → `VITE_USE_MOCK` env var.

Local dev always runs in mock mode (`VITE_USE_MOCK=true` in `.env`). The GitHub Pages demo also defaults to mock mode via the URL param in the demo link above.

---

## Team of One ownership

This project was built solo, which meant wearing four hats simultaneously.

### Product

Defined the feature scope by working backwards from the core question an operator asks: *"Why did my voice AI agent fail that call?"* That question drives the entire information architecture — sessions list → session transcript → tool call timeline → KPI trends. Features were prioritised by how directly they answer that question:

- **P0**: Session list, session transcript, tool reliability chart
- **P1**: KPI trends, version comparison, recommendations engine
- **P2**: Ingestion config UI, GHL integration panel

Out-of-scope for this build: authentication, multi-tenant isolation, alerting/webhooks.

### Design

Used a token-based CSS approach — spacing, colour, radius, and type scale are all defined as CSS custom properties in `src/styles/`. All UI components (Pill, OutcomeBadge, Sparkline, Delta, Tooltip) are stateless primitives that consume tokens, making the visual system easy to extend without touching component logic. Colour choices reflect the operational context: neutral greys for structure, amber for warnings, red for failures, teal for success.

No external component library was used — every component is purpose-built, which keeps the bundle small and avoids fighting against library defaults.

### Engineering

Key decisions:

- **Hash router** — enables zero-config static hosting (GitHub Pages, S3) without server-side rewrite rules.
- **In-process mock resolver** — replaced MSW service worker because service worker scope is incompatible with subdirectory deploys (`/flywheel-ui/`) when API paths are root-relative. The resolver is ~100 lines, dependency-free, and works identically on localhost and in production.
- **Vue Query over Vuex/Pinia** — the data model is almost entirely server state (not shared client state), so a server-state library is a better fit. Cache invalidation and loading states come for free.
- **Composables over inline logic** — `useSSE`, `useAgentContext`, and `useFormatters` extract the non-trivial logic out of templates, keeping screens declarative.

### QA

All testing is fixture-driven via the mock flag:

- Every API route has a corresponding fixture in `src/mocks/fixtures/`. Adding a new route requires adding a fixture — the mock resolver throws on unmatched paths, making coverage gaps obvious immediately.
- The `?mock=true` URL flag lets a reviewer exercise every screen and interaction without a running backend.
- Simulated latency (80–250 ms) ensures loading states and skeleton screens are tested in every run, not just on slow networks.
- TypeScript strict mode + `vue-tsc` type-check on every build catches contract mismatches between fixture data and component props before they reach the browser.

---

## Functional vs mocked

| Feature | Status | Notes |
|---|---|---|
| Routing & navigation | **Functional** | All routes, back/forward, deep-link |
| Overview dashboard | **Functional** | Renders from fixture data |
| Agent list & detail | **Functional** | All tabs render correctly |
| Session list | **Functional** | Filterable, sortable |
| Session transcript viewer | **Functional** | Turn-by-turn transcript with tool calls |
| Tool reliability chart | **Functional** | Success/failure breakdown per tool |
| KPI trend charts | **Functional** | Sparkline + delta, time-series data |
| Version comparison diff | **Functional** | Side-by-side prompt diff |
| Recommendations panel | **Functional** | Status transitions (open → applied/dismissed) |
| Config tab | **Functional** | System prompt, tool list, model config |
| Live event stream (Monitor) | **Functional UI, mocked feed** | `MockSSEFeed` drives events via `setInterval`; real mode connects to `EventSource('/api/events')` |
| Mock flag URL toggle | **Functional** | `?mock=true/false` + sessionStorage persistence |
| All API data (agents, sessions, KPIs, …) | **Mocked** | `mockResolver.ts` routes to fixture files — no real backend needed |
| Real-time transcript ingestion | **Mocked** | Represented by `sessionDetail` fixture; real path is POST/SSE to `/api/ingest` |
| Authentication | **Not implemented** | Out of scope |
| Alerting / webhooks | **Not implemented** | Out of scope |

### Real backend contract (ready to wire up)

When a real backend is available, set `VITE_USE_MOCK=false` (or visit with `?mock=false`). The app will call:

```
GET  /api/overview
GET  /api/agents
GET  /api/agents/:id
GET  /api/agents/:id/sessions
GET  /api/sessions/:id
GET  /api/agents/:id/tool-reliability
GET  /api/agents/:id/kpis
GET  /api/agents/:id/recommendations
GET  /api/agents/:id/versions
GET  /api/agents/:id/version-compare
GET  /api/ingestion
SSE  /api/events
```

All request/response shapes are defined in [`src/api/types.ts`](src/api/types.ts). The fixture files in `src/mocks/fixtures/` serve as the schema reference for backend implementors.

---

## Running locally

```bash
# Install dependencies
pnpm install

# Start dev server (mock mode on by default)
pnpm dev
# → http://localhost:5174/?mock=true

# Type-check
pnpm typecheck

# Production build
pnpm build
```

The `.env` file sets `VITE_USE_MOCK=true`, so local dev always uses fixture data. To test real API integration locally, run with `?mock=false` and have the backend running at `http://localhost:5174/api`.
