import { useSearchParams } from 'react-router-dom'
import { analyticsApi, categoriesApi } from '../api/endpoints'
import type { TechnologyTrendTO } from '../api/types'
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncStates'
import { PageHeader } from '../components/PageHeader'
import { AnalyticsTabs } from '../components/analytics/AnalyticsTabs'
import { BarChart } from '../components/analytics/BarChart'
import { CategoryField } from '../components/analytics/CategoryField'
import { DateRangeForm } from '../components/analytics/DateRangeForm'
import { SourcesField } from '../components/analytics/SourcesField'
import { useApiQuery } from '../hooks/useApiQuery'
import {
  clampPercentage,
  formatMonth,
  formatShare,
  parseSourceList,
  resolveRange,
  type DateRange,
} from '../lib/analytics'

export function TechnologyTrendPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryKey = searchParams.toString()
  const { range, error: rangeError } = resolveRange(searchParams)
  const technologyName = (searchParams.get('technologyName') ?? '').trim()
  const categoryName = searchParams.get('categoryName') ?? ''
  const sources = parseSourceList(searchParams.getAll('sources').join(','))

  const categories = useApiQuery((signal) => categoriesApi.list(signal), [])

  function handleApply(next: DateRange, values: Record<string, string>) {
    const params = new URLSearchParams()
    params.set('dateFrom', next.from)
    params.set('dateTo', next.to)

    if (values.technologyName) {
      params.set('technologyName', values.technologyName)
    }
    if (values.categoryName) {
      params.set('categoryName', values.categoryName)
    }
    for (const source of parseSourceList(values.sources)) {
      params.append('sources', source)
    }

    setSearchParams(params)
  }

  return (
    <div className="page">
      <PageHeader
        title="Technology trend"
        description="Monthly mentions for one technology. The backend returns every month in the range, including zero months."
        badge="Analytics"
      />
      <AnalyticsTabs />

      <DateRangeForm
        key={queryKey}
        initialFrom={range.from}
        initialTo={range.to}
        onApply={handleApply}
      >
        <label className="field">
          <span>Technology</span>
          <input
            type="text"
            name="technologyName"
            placeholder="e.g. Java"
            defaultValue={technologyName}
            required
          />
        </label>
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
      ) : technologyName.length === 0 ? (
        <EmptyState
          title="Choose a technology"
          description="Enter a technology name (for example Java or React) to load its monthly trend."
        />
      ) : (
        <TrendResults
          technologyName={technologyName}
          dateFrom={range.from}
          dateTo={range.to}
          categoryName={categoryName}
          sources={sources}
        />
      )}
    </div>
  )
}

interface TrendResultsProps {
  technologyName: string
  dateFrom: string
  dateTo: string
  categoryName: string
  sources: string[]
}

function TrendResults({
  technologyName,
  dateFrom,
  dateTo,
  categoryName,
  sources,
}: TrendResultsProps) {
  const trend = useApiQuery(
    (signal) =>
      analyticsApi.technologiesTrend(
        {
          technologyName,
          dateFrom,
          dateTo,
          categoryName: categoryName || undefined,
          sources: sources.length > 0 ? sources : undefined,
        },
        signal,
      ),
    [technologyName, dateFrom, dateTo, categoryName, sources.join(',')],
  )

  if (trend.status === 'loading') {
    return <LoadingState label="Calculating monthly trend…" />
  }

  if (trend.status === 'error') {
    return <ErrorState error={trend.error} onRetry={trend.reload} />
  }

  if (!trend.data) {
    return null
  }

  return <TrendContent data={trend.data} />
}

function TrendContent({ data }: { data: TechnologyTrendTO }) {
  const chartPoints = data.points.map((point) => ({
    key: point.month,
    label: formatMonth(point.month),
    value: point.count,
    display: String(point.count),
  }))

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
          <span className="stat__label">Months in range</span>
          <span className="stat__value">{data.points.length}</span>
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
        <span className="tag tag--accent">{data.technologyName}</span>
        <span className="tag">{data.dateFrom ?? '—'} → {data.dateTo ?? '—'}</span>
        <span className="tag">Period field: {data.periodField ?? 'publishedAt'}</span>
        <span className="tag">
          Month assignment: {data.monthAssignment ?? 'publishedAt'}
        </span>
        <span className="tag">Category: {data.categoryName || 'all'}</span>
        <span className="tag">
          Sources: {data.sources && data.sources.length > 0 ? data.sources.join(', ') : 'all'}
        </span>
      </div>

      {data.points.length === 0 ? (
        <EmptyState
          title="No monthly points"
          description="The backend returned no months for this range. Widen the dates and try again."
        />
      ) : (
        <>
          <section className="card chart-card">
            <div className="chart-card__head">
              <div>
                <h2>Monthly mentions</h2>
                <p className="muted">
                  Count of offers that mention {data.technologyName} per month.
                </p>
              </div>
              <span className="badge badge--muted">Counts</span>
            </div>
            <BarChart
              points={chartPoints}
              caption="Exact values are listed in the table below. Zero-height bars represent zero mentions."
            />
          </section>

          <div className="card table-card">
            <div className="table-scroll">
              <table className="data-table">
                <caption className="sr-only">
                  Monthly count, denominator and share for {data.technologyName}
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Month</th>
                    <th scope="col" className="is-numeric">Offers mentioning</th>
                    <th scope="col" className="is-numeric">Eligible offers</th>
                    <th scope="col">Share of monthly offers</th>
                  </tr>
                </thead>
                <tbody>
                  {data.points.map((point) => (
                    <tr key={point.month}>
                      <th scope="row">{formatMonth(point.month)}</th>
                      <td className="is-numeric is-strong">{point.count}</td>
                      <td className="is-numeric is-muted">{point.denominator}</td>
                      <td>
                        <div className="share-cell">
                          <span className="share-bar" aria-hidden="true">
                            <span
                              style={{
                                width: `${clampPercentage(point.sharePercentage)}%`,
                              }}
                            />
                          </span>
                          <span className="share-cell__value">
                            {formatShare(point.sharePercentage)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="analytics-note">
            Months without matching offers are preserved as zero. The monthly
            denominator can differ from the scope denominator.
          </p>
        </>
      )}
    </>
  )
}
