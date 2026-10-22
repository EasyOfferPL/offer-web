# EasyOffer Analytics — frontend

Small React frontend that demonstrates the EasyOffer backend: offers, technology
analytics, salary statistics and source data completeness.

> Status: **M1 — application foundation**. Routes, layout, API client and shared
> request states exist. The offer and analytics views are placeholders until M2/M3.
> This repository is not yet evidence for F-030; that requires G5 (deployed demo).

## Stack

- React 19 + TypeScript
- Vite 8
- React Router 7
- ESLint

No chart library is chosen yet (open decision FE-011); M3 starts with accessible
tables and only adds charts if the decision is made.

## Requirements

- Node.js 20.19+ or 22.12+ (tested with Node 24)
- npm 10+
- A running EasyOffer backend exposing `/v3/api-docs`

## Run locally

```powershell
npm install
npm run dev
```

Open http://localhost:5173.

By default the dev server proxies `/api/*` to `http://localhost:8080`. If the
backend runs elsewhere, copy `.env.example` to `.env` and set:

```
API_PROXY_TARGET=http://localhost:8081
```

The browser never calls the backend directly: it always uses `VITE_API_BASE_URL`,
which defaults to `/api`. In production the same path must be served by a reverse
proxy to the backend, because the backend has no explicit CORS configuration.

### Environment variables

| Variable | Exposed to browser | Purpose |
| --- | --- | --- |
| `VITE_API_BASE_URL` | yes | Public API base path, default `/api` |
| `API_PROXY_TARGET` | no | Dev-only proxy target |

Never put backend secrets (for example `X-Dataset-Export-Key`) in any `VITE_*`
variable: everything prefixed with `VITE_` ends up in the browser bundle.
`POST /v1.0/admin/datasets` must not be reachable from the UI.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Dev server with `/api` proxy |
| `npm run build` | Type-check and production build |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |

## Structure

```
src/
  api/          config, typed models, error type, single fetch client, endpoints
  app/          route table
  components/   shared UI (request states, page header, placeholder)
  hooks/        useApiQuery (abort on unmount, ignore stale responses)
  layouts/      app shell
  pages/        one component per route
```

Rules kept by this layer:

- page numbers are zero-based and read from `PageResponseTO`, never `PageImpl`;
- analytics dates are inclusive `YYYY-MM-DD`; offer timestamps stay ISO date-time;
- non-2xx responses become `ApiError` with `message` and optional `details`;
- no admin endpoint and no server secret is referenced anywhere in `src/`.

## Contract status

`src/api/types.ts` is **provisional**. Capture the real contract before FE-008:

```powershell
curl http://localhost:8080/v3/api-docs -o docs/openapi-v1.json
```

Then reconcile field names in `src/api/types.ts` only. If the backend changes
after the M0 snapshot, OpenAPI changes first; the frontend must not silently
redefine backend semantics.

The human-readable `docs/frontend-api.md` handoff is git-ignored in the backend
repository (DEC-012) and must be copied into this repository manually.

## Roadmap

- [x] M0 — repository, scope, owners, API strategy
- [x] M1 — shell, routing, API client, loading/empty/error states
- [ ] M2 — offer list, filters, details
- [ ] M3 — technology, salary and completeness views
- [ ] M4 — tests, responsive/accessibility review
- [ ] M5 — same-origin deployment, smoke test, demo rehearsal

Dev-only page for reviewing request states: http://localhost:5173/dev/ui-states
(it is not included in production builds).
