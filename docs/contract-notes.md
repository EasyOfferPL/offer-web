# Verified backend contract notes

Source: `EasyOfferPL/offer-service`, branch `master`, commit
`07584d97fa4760b0aa30d2c56d1efac7d594bc64` (2026-10-20), read on 2026-10-22.

These notes record what the frontend types in `src/api/types.ts` are based on.
They are not a replacement for the generated OpenAPI document. When the backend
is running, capture it and diff the fields:

```powershell
curl http://localhost:8080/v3/api-docs -o docs/openapi-v1.json
```

## Pagination

`PageResponseTO<T>`: `content`, `page`, `size`, `totalElements`, `totalPages`,
`first`, `last`. Page numbers are zero-based. `/offers` and `/offers/search`
accept Spring `page`, `size` (default 20, max 200) and repeatable
`sort=property,direction`.

## Offers

`OfferResponseTO` fields: `id` (number), `externalId`, `title`, `companyName`,
`location`, `description`, `experienceLevel`, `employmentType`, `workMode`,
`salaryMin`, `salaryMax`, `salaryUnit`, `currency`, `salaryType`
(`GROSS | NET | UNKNOWN`), `source`, `url`, `language`, `createdAt`,
`updatedAt`, `technologies` (string list), `publishedAt`.

`/offers/search` accepts repeated list parameters: `ids`, `externalIds`,
`titles`, `companyNames`, `locations`, `experienceLevels`, `employmentTypes`,
`categoryNames`, `workModes`, `salaryUnits`, `currencies`, `sources`, `urls`,
`languages`, `technologies`. Single values: `salaryFrom`, `salaryTo`, and the
ISO date-time bounds `createdAtFrom/To`, `updatedAtFrom/To`,
`publishedAtFrom/To`.

## Categories

`GET /v1.0/categories` returns `[{ "categoryName": "JAVA" }]` - the name is the
only identifier exposed to clients.

## Analytics

All calendar parameters are `dateFrom` / `dateTo`, inclusive `YYYY-MM-DD`;
timestamp strings are rejected. `sources` is repeatable and normalized to
uppercase by the backend. There is no `from` / `to` alias.

- `GET /v1.0/analytics/technologies/popularity` - `dateFrom`, `dateTo`,
  optional `categoryName`, optional repeated `sources`, `page` (default 0),
  `size` (default 50, max 500). Returns scope metadata plus `technologies[]`
  with `technologyName`, `count`, `denominator`, `sharePercentage`, and its own
  `page`/`size`/`totalElements`/`totalPages`.
- `GET /v1.0/analytics/technologies/trend` - required `technologyName`,
  `dateFrom`, `dateTo`; optional `categoryName`, repeated `sources`. Returns
  `points[]` with `month`, `count`, `denominator`, `sharePercentage`.
- `GET /v1.0/analytics/salaries` - optional `categoryName`, `experienceLevel`.
  No date range. Returns `byCategory[]` and `byExperienceLevel[]` statistics
  with currency, unit, employment type, salary type, quantiles, offer count and
  `meetsRecommendedSampleSize`.
- `GET /v1.0/analytics/salaries/trend` - required `categoryName`, `currency`,
  `employmentType`, `dateFrom`, `dateTo`; optional `salaryType` (default
  `GROSS`) and `experienceLevel`.
- `GET /v1.0/analytics/data-completeness` - `dateFrom`, `dateTo`, optional
  repeated `sources`. Returns `bySource[]` with per-field
  `usableOfferCount`, `unusableOfferCount`, `eligibleOfferCount`,
  `completenessPercentage`.

## Errors

`ErrorResponse`: `timestamp`, `status`, `error`, `message`, `details` (list of
strings). The UI displays `message` and renders `details` when present.

## Administrative boundary

`POST /v1.0/admin/datasets` is not part of the frontend and must never be
called from the browser. `X-Dataset-Export-Key` must not appear in source,
bundles, storage or requests.
