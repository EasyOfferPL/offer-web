/**
 * Contract models aligned with EasyOffer backend sources (master @ 2026-10-22)
 * and the frontend handoff:
 * - GET /offers, /offers/search -> PageResponseTO (zero-based, first/last);
 * - GET /v1.0/categories -> CategoryTO[] with a single categoryName field;
 * - analytics calendar ranges use inclusive YYYY-MM-DD dateFrom/dateTo;
 * - offer timestamp filters stay ISO date-time;
 * - errors: ErrorResponse.details is a list of strings.
 *
 * Re-run the contract snapshot (GET /v3/api-docs) after every backend change.
 */

export interface PageResponseTO<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface PageParams {
  page: number
  size: number
  /** Spring sort syntax, e.g. "publishedAt,desc". Repeatable in the API. */
  sort?: string
}

export type SalaryType = 'GROSS' | 'NET' | 'UNKNOWN'

/** Mirrors pl.easyoffer.offer_service.model.to.OfferResponseTO. */
export interface OfferResponseTO {
  id: number
  externalId?: string | null
  title: string
  companyName?: string | null
  location?: string | null
  description?: string | null
  experienceLevel?: string | null
  employmentType?: string | null
  workMode?: string | null
  salaryMin?: number | null
  salaryMax?: number | null
  salaryUnit?: string | null
  currency?: string | null
  salaryType?: SalaryType | null
  source?: string | null
  url?: string | null
  language?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  technologies?: string[] | null
  publishedAt?: string | null
}

/** Mirrors CategoryTO: the category name is the identifier exposed to clients. */
export interface CategoryTO {
  categoryName: string
}

/** Mirrors OfferSearchRequest. Every list parameter may be repeated in the URL. */
export interface OfferSearchParams {
  ids?: number[]
  externalIds?: string[]
  titles?: string[]
  companyNames?: string[]
  locations?: string[]
  experienceLevels?: string[]
  employmentTypes?: string[]
  categoryNames?: string[]
  workModes?: string[]
  salaryFrom?: number
  salaryTo?: number
  salaryUnits?: string[]
  currencies?: string[]
  sources?: string[]
  urls?: string[]
  languages?: string[]
  /** ISO date-time */
  createdAtFrom?: string
  /** ISO date-time */
  createdAtTo?: string
  /** ISO date-time */
  updatedAtFrom?: string
  /** ISO date-time */
  updatedAtTo?: string
  technologies?: string[]
  /** ISO date-time */
  publishedAtFrom?: string
  /** ISO date-time */
  publishedAtTo?: string
}

export interface TechnologyPopularityItemTO {
  technologyName: string
  count: number
  denominator: number
  sharePercentage: number
}

export interface TechnologyPopularityTO {
  technologyNormalizationVersion?: string | null
  deduplicationVersion?: string | null
  periodField?: string | null
  categoryName?: string | null
  sources?: string[] | null
  dateFrom?: string | null
  dateTo?: string | null
  rawOfferCount: number
  uniqueOfferCount: number
  eligibleOfferCount: number
  page: number
  size: number
  totalElements: number
  totalPages: number
  technologies: TechnologyPopularityItemTO[]
}

export interface TechnologyTrendPointTO {
  /** YYYY-MM; months without data are returned as zero by the backend. */
  month: string
  count: number
  denominator: number
  sharePercentage: number
}

export interface TechnologyTrendTO {
  technologyNormalizationVersion?: string | null
  deduplicationVersion?: string | null
  periodField?: string | null
  monthAssignment?: string | null
  technologyName: string
  categoryName?: string | null
  sources?: string[] | null
  dateFrom?: string | null
  dateTo?: string | null
  rawOfferCount: number
  uniqueOfferCount: number
  eligibleOfferCount: number
  points: TechnologyTrendPointTO[]
}

export interface SalaryStatisticTO {
  groupValue: string
  currency: string
  salaryUnit: string
  employmentType: string
  salaryType: SalaryType
  minimumSalary: number
  percentile25Salary: number
  averageSalary: number
  medianSalary: number
  percentile75Salary: number
  maximumSalary: number
  offersCount: number
  meetsRecommendedSampleSize: boolean
}

export interface SalaryAnalyticsTO {
  salaryNormalizationVersion?: string | null
  quantileMethod?: string | null
  recommendedMinimumSampleSize: number
  byCategory: SalaryStatisticTO[]
  byExperienceLevel: SalaryStatisticTO[]
}

export interface SalaryTrendPointTO {
  /** YYYY-MM */
  month: string
  averageSalary?: number | null
  medianSalary?: number | null
  offersCount: number
}

export interface SalaryTrendTO {
  categoryName: string
  currency: string
  employmentType: string
  experienceLevel?: string | null
  salaryUnit: string
  salaryType: SalaryType
  points: SalaryTrendPointTO[]
}

export type DataCompletenessField =
  | 'SALARY'
  | 'TECHNOLOGIES'
  | 'EXPERIENCE_LEVEL'
  | 'LOCATION'
  | 'WORK_MODE'
  | 'PUBLISHED_AT'

export interface DataCompletenessFieldTO {
  field: DataCompletenessField
  usableOfferCount: number
  unusableOfferCount: number
  eligibleOfferCount: number
  completenessPercentage: number
}

export interface DataCompletenessSourceTO {
  source: string
  eligibleOfferCount: number
  fields: DataCompletenessFieldTO[]
}

export interface DataCompletenessTO {
  completenessVersion?: string | null
  salaryNormalizationVersion?: string | null
  periodField?: string | null
  unitOfAnalysis?: string | null
  sources?: string[] | null
  dateFrom?: string | null
  dateTo?: string | null
  eligibleOfferCount: number
  bySource: DataCompletenessSourceTO[]
}

export interface CategoryAnalyticsTO {
  categoryName: string
  offersCount: number
}

export interface AnalyticsTO {
  categoriesStatistic: CategoryAnalyticsTO[]
  newestJobOffers: OfferResponseTO[]
}
