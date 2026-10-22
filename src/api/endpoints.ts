import { apiRequest, type QueryParams } from './client'
import type {
  AnalyticsRange,
  Category,
  DataCompletenessResponse,
  OfferDetails,
  OfferSearchParams,
  OfferSummary,
  PageParams,
  PageResponseTO,
  SalaryDistributionResponse,
  SalaryTrendResponse,
  TechnologyPopularityResponse,
  TechnologyTrendResponse,
} from './types'

export const offersApi = {
  list(params: PageParams, signal?: AbortSignal) {
    return apiRequest<PageResponseTO<OfferSummary>>('/offers', {
      query: { page: params.page, size: params.size },
      signal,
    })
  },

  search(filters: OfferSearchParams, params: PageParams, signal?: AbortSignal) {
    return apiRequest<PageResponseTO<OfferSummary>>('/offers/search', {
      query: { ...filters, ...params } as QueryParams,
      signal,
    })
  },

  byId(id: string, signal?: AbortSignal) {
    return apiRequest<OfferDetails>(`/offers/${encodeURIComponent(id)}`, { signal })
  },
}

export const categoriesApi = {
  list(signal?: AbortSignal) {
    return apiRequest<Category[]>('/v1.0/categories', { signal })
  },
}

export const analyticsApi = {
  technologiesPopularity(range: AnalyticsRange, params: PageParams, signal?: AbortSignal) {
    return apiRequest<TechnologyPopularityResponse>('/v1.0/analytics/technologies/popularity', {
      query: { ...range, ...params },
      signal,
    })
  },

  technologiesTrend(range: AnalyticsRange, technology: string, signal?: AbortSignal) {
    return apiRequest<TechnologyTrendResponse>('/v1.0/analytics/technologies/trend', {
      query: { ...range, technology },
      signal,
    })
  },

  salaries(range: AnalyticsRange, signal?: AbortSignal) {
    return apiRequest<SalaryDistributionResponse>('/v1.0/analytics/salaries', {
      query: { ...range },
      signal,
    })
  },

  salariesTrend(range: AnalyticsRange, signal?: AbortSignal) {
    return apiRequest<SalaryTrendResponse>('/v1.0/analytics/salaries/trend', {
      query: { ...range },
      signal,
    })
  },

  dataCompleteness(range: AnalyticsRange, signal?: AbortSignal) {
    return apiRequest<DataCompletenessResponse>('/v1.0/analytics/data-completeness', {
      query: { ...range },
      signal,
    })
  },
}
