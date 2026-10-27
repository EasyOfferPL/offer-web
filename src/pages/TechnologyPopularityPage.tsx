import { useSearchParams } from 'react-router-dom'
import { analyticsApi, categoriesApi } from '../api/endpoints'
import type { TechnologyPopularityTO } from '../api/types'
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncStates'
import { PageHeader } from '../components/PageHeader'
import { Pagination } from '../components/Pagination'
import { AnalyticsTabs } from '../components/analytics/AnalyticsTabs'
import { CategoryField } from '../components/analytics/CategoryField'
import { DateRangeForm } from '../components/analytics/DateRangeForm'
import { SourcesField } from '../components/analytics/SourcesField'
import { useApiQuery } from '../hooks/useApiQuery'
import {
  clampPercentage,
  formatShare,
  parsePositiveInt,
  parseSourceList,
  resolveRange,
  type DateRange,
} from '../lib/analytics'

const PAGE_SIZES = [25, 50, 100, 250] as const
const DEFAULT_PAGE_SIZE = 50

export function TechnologyPopularityPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryKey = searchParams.toString()
  const { range, error: rangeError } = resolveRange(searchParams)
  const categoryName = searchParams.get('categoryName') ?? ''
  const sources = parseSourceList(searchParams.getAll('sources').join(','))
  const page = parsePositiveInt(searchParams.get('page'), 0)
  const size = parsePositiveInt(
    searchParams.get('size'),
    DEFAULT_PAGE_SIZE,
    PAGE_SIZES,
  )

  const categories = useApiQuery((signal) => categoriesApi.list(signal), [])

  function handleApply(next: DateRange, values: Record<string, string>) {
    const params = new URLSearchParams()
    params.set('dateFrom', next.from)
    params.set('dateTo', next.to)

    if (values.categoryName) {
      params.set('categoryName', values.categoryName)
    }
    for (const source of parseSourceList(values.sources)) {
      params.append('sources', source)
    }

    params.set('size', String(size))
    params.set('page', '0')
    setSearchParams(params)
  }

  function updateParams(mutate: (next: URLSearchParams) => void) {
    const next = new URLSearchParams(searchParams)
    mutate(next)
    setSearchParams(next)
  }

  return (
    <div className="page">
      <PageHeader
        title="Technology popularity"
        description="How often each technology appears in eligible offers. Count, denominator and share are separate values."
        badge="Analytics"
      />
      <AnalyticsTabs />

      <DateRangeForm
        key={queryKey}
        initialFrom={range.from}
        initialTo={range.to}
        onApply={handleApply}
      >
        <CategoryField
          categories={categories.data ?? []}
          defaultValue={categoryName}
        />
        <SourcesField defaultValue={sources} />
      </DateRangeForm>

      {rangeError ? (
        <div className="state state--error" role="alert">
          <p className="state__title">Invalid date range</p>
          <p>{rangeError}</p>
        </div>
      ) : (
        <PopularityResults
          dateFrom={range.from}
          dateTo={range.to}
          categoryName={categoryName}
          sources={sources}
          page={page}
          size={size}
          onPageChange={(nextPage) =>
            updateParams((next) => next.set('page', String(nextPage)))
          }
          onSizeChange={(nextSize) =>
            updateParams((next) => {
              next.set('size', String(nextSize))
              next.set('page', '0')
            })
          }
        />
      )}
    </div>
  )
}

interface PopularityResultsProps {
  dateFrom: string
  dateTo: string
  categoryName: string
  sources: string[]
  page: number
  size: number
  onPageChange: (page: number) => void
  onSizeChange: (size: number) => void
}

function PopularityResults({
  dateFrom,
  dateTo,
  categoryName,
  sources,
  page,
  size,
  onPageChange,
  onSizeChange,
}: PopularityResultsProps) {
  const popularity = useApiQuery(
    (signal) =>
      analyticsApi.technologiesPopularity(
        {
          dateFrom,
          dateTo,
          categoryName: categoryName || undefined,
          sources: sources.length > 0 ? sources : undefined,
          page,
          size,
        },
        signal,
      ),
    [dateFrom, dateTo, categoryName, sources.join(','), page, size],
  )

  if (popularity.status === 'loading') {
    return <LoadingState label="Calculating technology popularity…" />
  }

  if (popularity.status === 'error') {
    return <ErrorState error={popularity.error} onRetry={popularity.reload} />
  }

  if (!popularity.data) {
    return null
  }

  return <PopularityContent data={popularity.data} size={size} onPageChange={onPageChange} onSizeChange={onSizeChange} />
}

interface PopularityContentProps {
  data: TechnologyPopularityTO
  size: number
  onPageChange: (page: number) => void
  onSizeChange: (size: number) => void
}

function PopularityContent({
  data,
  size,
  onPageChange,
  onSizeChange,
}: PopularityContentProps) {
  const pageOutOfRange = data.totalElements > 0 && data.technologies.length === 0

  return (
    <>
      <section className="stat-rail" aria-label="Scope summary">
        <div className="stat">
          <span className="stat__label">Eligible offers (denominator)</span>
          <span className="stat__value stat__value--accent">
            {data.eligibleOfferCount}
          </span>
        </div>
        <div className="stat">
          <span className="stat__label">Technologies</span>
          <span className="stat__value">{data.totalElements}</span>
        </div>
        <div className="stat">
          <span className="stat__label">Unique offers</span>
          <span className="stat__value">{data.uniqueOfferCount}</span>
        </div>
        <div className="stat">
          <span className="stat__label">Raw offers</span>
          <span className="stat__value">{data.rawOfferCount}</span>
        </div>
      </section>

      <div className="analytics-meta" aria-label="Query scope">
        <span className="tag">{data.dateFrom ?? '—'} → {data.dateTo ?? '—'}</span>
        <span className="tag">Period field: {data.periodField ?? 'publishedAt'}</span>
        <span className="tag">Category: {data.categoryName || 'all'}</span>
        <span className="tag">
          Sources: {data.sources && data.sources.length > 0 ? data.sources.join(', ') : 'all'}
        </span>
        {data.technologyNormalizationVersion ? (
          <span className="tag">
            Normalisation: {data.technologyNormalizationVersion}
          </span>
        ) : null}
        {data.deduplicationVersion ? (
          <span className="tag">Deduplication: {data.deduplicationVersion}</span>
        ) : null}
      </div>

      {data.technologies.length === 0 ? (
        <EmptyState
          title={
            pageOutOfRange
              ? 'This page is outside the result set'
              : 'No technologies in this scope'
          }
          description={
            pageOutOfRange
              ? 'The selected page no longer exists. Return to the first page and continue.'
              : 'Widen the date range or remove the category and source filters.'
          }
          action={
            pageOutOfRange ? (
              <button
                className="btn btn--ghost"
                type="button"
                onClick={() => onPageChange(0)}
              >
                Back to first page
              </button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="toolbar">
            <p className="toolbar__summary">
              <strong>{data.totalElements}</strong>{' '}
              <span className="muted">
                technolog(ies) · page {data.page + 1} of{' '}
                {Math.max(data.totalPages, 1)}
              </span>
            </p>
            <div className="toolbar__controls">
              <label className="field field--inline">
                <span>Page size</span>
                <select
                  value={size}
                  onChange={(event) => onSizeChange(Number(event.target.value))}
                >
                  {PAGE_SIZES.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="card table-card">
            <div className="table-scroll" role="region" aria-label="Technology popularity data table" tabIndex={0}>
              <table className="data-table">
                <caption className="sr-only">
                  Technology counts, denominator and share for the selected scope
                </caption>
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Technology</th>
                    <th scope="col" className="is-numeric">Offers</th>
                    <th scope="col">Share of eligible offers</th>
                    <th scope="col" className="is-numeric">Denominator</th>
                  </tr>
                </thead>
                <tbody>
                  {data.technologies.map((technology, index) => (
                    <tr key={technology.technologyName}>
                      <td className="is-muted">
                        {data.page * data.size + index + 1}
                      </td>
                      <td className="is-strong">{technology.technologyName}</td>
                      <td className="is-numeric">{technology.count}</td>
                      <td>
                        <div className="share-cell">
                          <span className="share-bar" aria-hidden="true">
                            <span
                              style={{
                                width: `${clampPercentage(technology.sharePercentage)}%`,
                              }}
                            />
                          </span>
                          <span className="share-cell__value">
                            {formatShare(technology.sharePercentage)}
                          </span>
                        </div>
                      </td>
                      <td className="is-numeric is-muted">
                        {technology.denominator}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <Pagination
            page={data.page}
            totalPages={data.totalPages}
            first={data.page === 0}
            last={data.page >= Math.max(data.totalPages - 1, 0)}
            onChange={onPageChange}
          />

          <p className="analytics-note">
            Share is count divided by the denominator. Counts are offers that
            mention a technology; they are not percentages of all offers.
          </p>
        </>
      )}
    </>
  )
}
