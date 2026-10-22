/**
 * PROVISIONAL contract models (M1).
 *
 * These types describe what the UI needs, not a verified copy of the backend
 * schema. Before FE-008 / FE-011 start they must be reconciled with the
 * captured OpenAPI document (GET /v3/api-docs) and the docs/frontend-api.md
 * handoff. If a name differs, change it here only - no ad-hoc parsing in views.
 *
 * Known contract rules (see F-039):
 * - offer list/search use the stable PageResponseTO wrapper, not PageImpl;
 * - page numbers are zero-based;
 * - analytics date ranges are inclusive YYYY-MM-DD values;
 * - offer timestamp filters stay ISO date-time values.
 */

export interface PageResponseTO<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface PageParams {
  page: number
  size: number
}

export interface Category {
  id: string
  name: string
}

export interface OfferSummary {
  id: string
  title: string
  companyName?: string | null
  city?: string | null
  salaryFrom?: number | null
  salaryTo?: number | null
  currency?: string | null
  publishedAt?: string | null
}

export interface OfferDetails extends OfferSummary {
  description?: string | null
  source?: string | null
  category?: string | null
  technologies?: string[] | null
  updatedAt?: string | null
}

export interface OfferSearchParams {
  phrase?: string
  category?: string
  city?: string
  source?: string
  salaryFrom?: number
  salaryTo?: number
  /** ISO date-time, not a plain date. */
  publishedFrom?: string
  /** ISO date-time, not a plain date. */
  publishedTo?: string
}

/** Inclusive YYYY-MM-DD range used by every analytics endpoint. */
export interface AnalyticsRange {
  from: string
  to: string
  source?: string
  category?: string
}

export interface TechnologyPopularityItem {
  technology: string
  count: number
  denominator?: number
  share?: number
}

export type TechnologyPopularityResponse = PageResponseTO<TechnologyPopularityItem>

export interface TechnologyTrendPoint {
  /** YYYY-MM; months without offers must be kept as zero. */
  month: string
  count: number
  share?: number
}

export interface TechnologyTrendResponse {
  technology: string
  points: TechnologyTrendPoint[]
}

export interface SalaryBucket {
  label: string
  count: number
}

export interface SalaryDistributionResponse {
  currency: string
  salaryUnit: string
  employmentType?: string | null
  grossNet?: string | null
  sampleSize: number
  exploratory: boolean
  buckets: SalaryBucket[]
}

export interface SalaryTrendPoint {
  /** YYYY-MM */
  month: string
  sampleSize: number
  median?: number | null
  p25?: number | null
  p75?: number | null
}

export interface SalaryTrendResponse {
  currency: string
  salaryUnit: string
  employmentType?: string | null
  grossNet?: string | null
  exploratory: boolean
  points: SalaryTrendPoint[]
}

export interface DataCompletenessField {
  field: string
  eligible: number
  usable: number
  usableShare: number
}

export interface DataCompletenessSource {
  source: string
  periodFrom?: string | null
  periodTo?: string | null
  fields: DataCompletenessField[]
}

export interface DataCompletenessResponse {
  sources: DataCompletenessSource[]
}
