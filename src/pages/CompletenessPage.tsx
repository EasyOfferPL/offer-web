import { useSearchParams } from 'react-router-dom'
import { analyticsApi } from '../api/endpoints'
import type {
  DataCompletenessField,
  DataCompletenessTO,
} from '../api/types'
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncStates'
import { PageHeader } from '../components/PageHeader'
import { AnalyticsTabs } from '../components/analytics/AnalyticsTabs'
import { DateRangeForm } from '../components/analytics/DateRangeForm'
import { SourcesField } from '../components/analytics/SourcesField'
import { useApiQuery } from '../hooks/useApiQuery'
import {
  clampPercentage,
  parseSourceList,
  resolveRange,
  type DateRange,
} from '../lib/analytics'
import { humanize } from '../lib/format'

const FIELD_LABELS: Record<DataCompletenessField, string> = {
  SALARY: 'Salary',
  TECHNOLOGIES: 'Technologies',
  EXPERIENCE_LEVEL: 'Experience level',
  LOCATION: 'Location',
  WORK_MODE: 'Work mode',
  PUBLISHED_AT: 'Publication date',
}

export function CompletenessPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryKey = searchParams.toString()
  const { range, error: rangeError } = resolveRange(searchParams)
  const sources = parseSourceList(searchParams.getAll('sources').join(','))

  function handleApply(next: DateRange, values: Record<string, string>) {
    const params = new URLSearchParams()
    params.set('dateFrom', next.from)
    params.set('dateTo', next.to)
    for (const source of parseSourceList(values.sources)) {
      params.append('sources', source)
    }
    setSearchParams(params)
  }

  return (
    <div className="page">
      <PageHeader
        title="Source data completeness"
        description="How much of the selected source data can be used for each field. Percentages use eligible offers as the denominator."
        badge="Analytics"
      />
      <AnalyticsTabs />

      <DateRangeForm
        key={queryKey}
        initialFrom={range.from}
        initialTo={range.to}
        onApply={handleApply}
      >
        <SourcesField defaultValue={sources} />
      </DateRangeForm>

      {rangeError ? (
        <div className="state state--error" role="alert">
          <p className="state__title">Invalid date range</p>
          <p>{rangeError}</p>
        </div>
      ) : (
        <CompletenessResults
          dateFrom={range.from}
          dateTo={range.to}
          sources={sources}
        />
      )}
    </div>
  )
}

interface CompletenessResultsProps {
  dateFrom: string
  dateTo: string
  sources: string[]
}

function CompletenessResults({
  dateFrom,
  dateTo,
  sources,
}: CompletenessResultsProps) {
  const completeness = useApiQuery(
    (signal) =>
      analyticsApi.dataCompleteness(
        {
          dateFrom,
          dateTo,
          sources: sources.length > 0 ? sources : undefined,
        },
        signal,
      ),
    [dateFrom, dateTo, sources.join(',')],
  )

  if (completeness.status === 'loading') {
    return <LoadingState label="Calculating completeness…" />
  }

  if (completeness.status === 'error') {
    return <ErrorState error={completeness.error} onRetry={completeness.reload} />
  }

  if (!completeness.data) {
    return null
  }

  return <CompletenessContent data={completeness.data} />
}

function CompletenessContent({ data }: { data: DataCompletenessTO }) {
  const fieldCount = data.bySource[0]?.fields.length ?? 0

  return (
    <>
      <section className="stat-rail" aria-label="Scope summary">
        <div className="stat">
          <span className="stat__label">Eligible offers</span>
          <span className="stat__value stat__value--accent">
            {data.eligibleOfferCount}
          </span>
        </div>
        <div className="stat">
          <span className="stat__label">Sources</span>
          <span className="stat__value">{data.bySource.length}</span>
        </div>
        <div className="stat">
          <span className="stat__label">Fields tracked</span>
          <span className="stat__value">{fieldCount}</span>
        </div>
        <div className="stat">
          <span className="stat__label">Period field</span>
          <span className="stat__value stat__value--text">
            {data.periodField ?? 'publishedAt'}
          </span>
        </div>
      </section>

      <div className="analytics-meta" aria-label="Completeness scope">
        <span className="tag">{data.dateFrom ?? '—'} → {data.dateTo ?? '—'}</span>
        <span className="tag">
          Sources: {data.sources && data.sources.length > 0 ? data.sources.join(', ') : 'all'}
        </span>
        {data.unitOfAnalysis ? (
          <span className="tag">Unit: {data.unitOfAnalysis}</span>
        ) : null}
        {data.completenessVersion ? (
          <span className="tag">Version: {data.completenessVersion}</span>
        ) : null}
        {data.salaryNormalizationVersion ? (
          <span className="tag">
            Salary normalisation: {data.salaryNormalizationVersion}
          </span>
        ) : null}
      </div>

      {data.bySource.length === 0 ? (
        <EmptyState
          title="No sources in this scope"
          description="Remove the source filter or widen the date range."
        />
      ) : (
        <>
          <div className="completeness-grid">
            {data.bySource.map((source) => (
              <section
                key={source.source}
                className="card completeness-card"
                aria-labelledby={`source-${source.source}`}
              >
                <header className="completeness-card__head">
                  <div>
                    <h2 id={`source-${source.source}`}>
                      {humanize(source.source)}
                    </h2>
                    <p className="muted">{source.source}</p>
                  </div>
                  <span className="badge badge--muted">
                    {source.eligibleOfferCount} eligible
                  </span>
                </header>

                <ul className="completeness-list">
                  {source.fields.map((field) => (
                    <li key={field.field} className="completeness-row">
                      <div className="completeness-row__head">
                        <span className="completeness-row__label">
                          {FIELD_LABELS[field.field]}
                        </span>
                        <span className="completeness-row__value">
                          {clampPercentage(field.completenessPercentage).toFixed(1)}%
                        </span>
                      </div>
                      <div
                        className="progress"
                        role="img"
                        aria-label={`${FIELD_LABELS[field.field]}: ${field.usableOfferCount} of ${field.eligibleOfferCount} eligible offers usable`}
                      >
                        <span
                          className="progress__fill"
                          style={{
                            width: `${clampPercentage(field.completenessPercentage)}%`,
                          }}
                        />
                      </div>
                      <p className="completeness-row__meta">
                        {field.usableOfferCount} usable ·{' '}
                        {field.unusableOfferCount} unusable ·{' '}
                        {field.eligibleOfferCount} eligible
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <p className="analytics-note">
            Completeness is usable offers divided by eligible offers for a field
            within a source. It measures data availability, not offer quality or
            market share.
          </p>
        </>
      )}
    </>
  )
}
