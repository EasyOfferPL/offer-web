# EasyOffer Analytics — frontend

Small React frontend that demonstrates the EasyOffer backend: offers, technology
analytics, salary statistics and source data completeness.

> Status: **M3 — analytics views**. Offers, technology popularity and trend,
> salary distribution and trend, and source data completeness are implemented
> against the verified contract. Tests and the responsive/accessibility review
> are M4. This repository is not yet evidence for F-030; that requires G5
> (deployed demo).

## Stack

- React 19 + TypeScript
- Vite 8
- React Router 7
- ESLint

M3 uses accessible tables plus lightweight CSS/SVG bars for the two trend
views; no chart library is required. Charts are always paired with an exact
table, and zero/null points are rendered explicitly instead of being dropped.

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

### Demo API (synthetic, development only)

If `offer-service` is not running, the proxy returns **502** and the UI has no
categories or offers. To keep working on the interface, start the bundled mock
in a second terminal:

```powershell
npm run mock:api
```

It listens on `http://localhost:8080` and serves 57 synthetic offers, categories,
computed technology popularity/trend, salary distribution/trend and source
completeness envelopes. The data deliberately includes missing fields and small
salary groups so the UI exercises null, zero-month and exploratory states. Data
is generated in memory and is reset on every restart. **Do not use it for
screenshots, demos or thesis evidence** — those must use the real backend and
persisted data. Stop it (`Ctrl+C`) before starting the real service, otherwise
port 8080 stays busy.

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
| `npm run mock:api` | Synthetic demo API on :8080 (dev only, never for evidence) |
| `npm run build` | Type-check and production build |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint |

## Structure

```
src/
  api/          config, contract types, error type, single fetch client, endpoints
  app/          route table
  components/   shared UI (request states, page header, offer card, pagination,
                analytics controls, charts and salary cards)
  hooks/        useApiQuery (abort on unmount, ignore stale responses)
  layouts/      app shell
  lib/          URL query parsing, analytics range helpers and display formatting
  pages/        one component per route
```

Rules kept by this layer:

- page numbers are zero-based and read from `PageResponseTO` (`first`/`last` too);
- analytics use `dateFrom`/`dateTo` inclusive `YYYY-MM-DD`, never timestamps;
- invalid or inverted analytics ranges are blocked before any request;
- every analytics view states its scope, denominator and unit;
- salary groups keep currency, salary unit, employment type and gross/net;
  groups are never combined into one scale;
- offer timestamp filters stay ISO date-time;
- search filters are repeated query parameters and are kept in the URL;
- changing a filter or page size resets `page` to 0;
- non-2xx responses become `ApiError` with `message` and a list of `details`;
- no admin endpoint and no server secret is referenced anywhere in `src/`.

## Contract status

Types in `src/api/types.ts` are aligned with the verified backend sources; see
[`docs/contract-notes.md`](docs/contract-notes.md) for the exact fields and the
verified commit. Capture the generated document when the backend is running:

```powershell
curl http://localhost:8080/v3/api-docs -o docs/openapi-v1.json
```

If the backend changes after the M0 snapshot, OpenAPI changes first; the
frontend must not silently redefine backend semantics.

The human-readable `docs/frontend-api.md` handoff is git-ignored in the backend
repository (DEC-012) and must be copied into this repository manually.

## Roadmap

- [x] M0 — repository, scope, owners, API strategy
- [x] M1 — shell, routing, API client, loading/empty/error states
- [x] M2 — offer list, filters, details
- [x] M3 — technology, salary and completeness views
- [ ] M4 — tests, responsive/accessibility review
- [ ] M5 — same-origin deployment, smoke test, demo rehearsal

Dev-only page for reviewing request states: http://localhost:5173/dev/ui-states
(it is not included in production builds).
