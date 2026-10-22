import { apiRequest } from './client'
import type {
  AnalyticsTO,
  CategoryTO,
  DataCompletenessTO,
  OfferResponseTO,
  OfferSearchParams,
  PageParams,
  PageResponseTO,
  SalaryAnalyticsTO,
  SalaryTrendTO,
  SalaryType,
  TechnologyPopularityTO,
  TechnologyTrendTO,
} from './types'

export const offersApi = {
  list(params: PageParams, signal?: AbortSignal) {
    return apiRequest<PageResponseTO<OfferResponseTO>>('/offers', {
      query: { page: params.page, size: params.size, sort: params.sort },
      signal,
    })
  },

  search(filters: OfferSearchParams, params: PageParams, signal?: AbortSignal) {
    return apiRequest<PageResponseTO<OfferResponseTO>>('/offers/search', {
      query: { ...filters, page: params.page, size: params.size, sort: params.sort },
      signal,
    })
  },

  byId(id: number | string, signal?: AbortSignal) {
    return apiRequest<OfferResponseTO>(`/offers/${encodeURIComponent(String(id))}`, {
      signal,
    })
  },
}

export const categoriesApi = {
  list(signal?: AbortSignal) {
    return apiRequest<CategoryTO[]>('/v1.0/categories', { signal })
  },
}

interface PopularityParams {
  dateFrom: string
  dateTo: string
  categoryName?: string
  sources?: string[]
  page: number
  size: number
}

interface TrendParams {
  technologyName: string
  dateFrom: string
  dateTo: string
  categoryName?: string
  sources?: string[]
}

interface SalaryDistributionParams {
  categoryName?: string
  experienceLevel?: string
}

interface SalaryTrendParams {
  categoryName: string
  currency: string
  employmentType: string
  salaryType?: SalaryType
  experienceLevel?: string
  dateFrom: string
  dateTo: string
}

interface CompletenessParams {
  dateFrom: string
  dateTo: string
  sources?: string[]
}

export const analyticsApi = {
  /** Optional convenience endpoint; not required for the first release. */
  dashboard(signal?: AbortSignal) {
    return apiRequest<AnalyticsTO>('/v1.0/analytics', { signal })
  },

  technologiesPopularity(params: PopularityParams, signal?: AbortSignal) {
    return apiRequest<TechnologyPopularityTO>(
      '/v1.0/analytics/technologies/popularity',
      { query: { ...params }, signal },
    )
  },

  technologiesTrend(params: TrendParams, signal?: AbortSignal) {
    return apiRequest<TechnologyTrendTO>('/v1.0/analytics/technologies/trend', {
      query: { ...params },
      signal,
    })
  },

  salaries(params: SalaryDistributionParams = {}, signal?: AbortSignal) {
    return apiRequest<SalaryAnalyticsTO>('/v1.0/analytics/salaries', {
      query: { ...params },
      signal,
    })
  },

  salariesTrend(params: SalaryTrendParams, signal?: AbortSignal) {
    return apiRequest<SalaryTrendTO>('/v1.0/analytics/salaries/trend', {
      query: { ...params },
      signal,
    })
  },

  dataCompleteness(params: CompletenessParams, signal?: AbortSignal) {
    return apiRequest<DataCompletenessTO>('/v1.0/analytics/data-completeness', {
      query: { ...params },
      signal,
    })
  },
}
