import type { OfferSearchParams } from '../api/types'

export const PAGE_SIZES = [20, 50, 100] as const
export const DEFAULT_PAGE_SIZE = 20
export const DEFAULT_SORT = 'publishedAt,desc'

/** List-valued query parameters: every value is sent as a repeated parameter. */
const LIST_KEYS = [
  'ids',
  'externalIds',
  'titles',
  'companyNames',
  'locations',
  'experienceLevels',
  'employmentTypes',
  'categoryNames',
  'workModes',
  'salaryUnits',
  'currencies',
  'sources',
  'urls',
  'languages',
  'technologies',
] as const

/** Single-valued query parameters. */
const RANGE_KEYS = [
  'salaryFrom',
  'salaryTo',
  'createdAtFrom',
  'createdAtTo',
  'updatedAtFrom',
  'updatedAtTo',
  'publishedAtFrom',
  'publishedAtTo',
] as const

export const FILTER_KEYS = [...LIST_KEYS, ...RANGE_KEYS] as const

export interface OffersUrlState {
  page: number
  size: number
  sort: string
  filters: OfferSearchParams
  hasFilters: boolean
  filtersCount: number
}

function parsePage(value: string | null): number {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0
}

function parseSize(value: string | null): number {
  const parsed = Number(value)
  return (PAGE_SIZES as readonly number[]).includes(parsed) ? parsed : DEFAULT_PAGE_SIZE
}

/**
 * Reads the URL once and produces both the request parameters and the
 * information the page needs to render. Filter state is never duplicated in
 * component state, so reload/back/forward always reproduce the same request.
 */
export function parseOffersQuery(params: URLSearchParams): OffersUrlState {
  const filters: Record<string, unknown> = {}
  let filtersCount = 0

  for (const key of LIST_KEYS) {
    const values = params
      .getAll(key)
      .map((value) => value.trim())
      .filter(Boolean)

    if (values.length === 0) {
      continue
    }

    if (key === 'ids') {
      const ids = values
        .map(Number)
        .filter((id) => Number.isInteger(id) && id > 0)
      if (ids.length > 0) {
        filters[key] = ids
        filtersCount += ids.length
      }
      continue
    }

    filters[key] = values
    filtersCount += values.length
  }

  for (const key of RANGE_KEYS) {
    const raw = params.get(key)
    if (!raw) {
      continue
    }

    if (key === 'salaryFrom' || key === 'salaryTo') {
      const amount = Number(raw)
      if (Number.isFinite(amount)) {
        filters[key] = amount
        filtersCount += 1
      }
      continue
    }

    filters[key] = raw
    filtersCount += 1
  }

  return {
    page: parsePage(params.get('page')),
    size: parseSize(params.get('size')),
    sort: params.get('sort') || DEFAULT_SORT,
    filters: filters as OfferSearchParams,
    hasFilters: filtersCount > 0,
    filtersCount,
  }
}
