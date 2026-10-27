import type { FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { analyticsApi, categoriesApi } from '../api/endpoints'
import type { SalaryAnalyticsTO, SalaryTrendTO } from '../api/types'
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncStates'
import { PageHeader } from '../components/PageHeader'
import { AnalyticsTabs } from '../components/analytics/AnalyticsTabs'
import { BarChart } from '../components/analytics/BarChart'
import { CategoryField } from '../components/analytics/CategoryField'
import { DateRangeForm } from '../components/analytics/DateRangeForm'
import { SalaryCard } from '../components/analytics/SalaryCard'
import { useApiQuery } from '../hooks/useApiQuery'
import {
  formatMonth,
  resolveRange,
  type DateRange,
} from '../lib/analytics'
import { formatNumber, humanize } from '../lib/format'

export function SalariesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryKey = searchParams.toString()
  const categories = useApiQuery((signal) => categoriesApi.list(signal), [])

  const distributionCategory = searchParams.get('distCategory') ?? ''
  const distributionExperience = searchParams.get('distExperience') ?? ''

  const { range, error: rangeError } = resolveRange(searchParams)
  const trendCategory = searchParams.get('categoryName') ?? ''
  const trendCurrency = (searchParams.get('currency') ?? '').trim().toUpperCase()
  const trendEmployment = (searchParams.get('employmentType') ?? '')
    .trim()
    .toUpperCase()
  const trendSalaryType = searchParams.get('salaryType') === 'NET' ? 'NET' : 'GROSS'
  const trendExperience = searchParams.get('experienceLevel') ?? ''
  const hasTrendScope =
    trendCategory.length > 0 &&
    trendCurrency.length > 0 &&
    trendEmployment.length > 0

  function handleDistributionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const next = new URLSearchParams(searchParams)
    next.delete('distCategory')
    next.delete('distExperience')

    const category = String(data.get('distCategory') ?? '').trim()
    const experience = String(data.get('distExperience') ?? '').trim()
    if (category) {
      next.set('distCategory', category)
    }
    if (experience) {
      next.set('distExperience', experience)
    }

    setSearchParams(next)
  }

  function clearDistribution() {
    const next = new URLSearchParams(searchParams)
    next.delete('distCategory')
    next.delete('distExperience')
    setSearchParams(next)
  }

  function handleTrendApply(nextRange: DateRange, values: Record<string, string>) {
    const next = new URLSearchParams(searchParams)
    for (const key of [
      'dateFrom',
      'dateTo',
      'categoryName',
      'currency',
      'employmentType',
      'salaryType',
      'experienceLevel',
    ]) {
      next.delete(key)
    }

    next.set('dateFrom', nextRange.from)
    next.set('dateTo', nextRange.to)

    if (values.categoryName) {
      next.set('categoryName', values.categoryName)
    }
    if (values.currency) {
      next.set('currency', values.currency.toUpperCase())
    }
    if (values.employmentType) {
      next.set('employmentType', values.employmentType.toUpperCase())
    }
    next.set('salaryType', values.salaryType === 'NET' ? 'NET' : 'GROSS')
    if (values.experienceLevel) {
      next.set('experienceLevel', values.experienceLevel)
    }

    setSearchParams(next)
  }

  return (
    <div className="page">
      <PageHeader
        title="Salary distribution and trend"
        description="Compare like with like: every group keeps its currency, salary unit, employment type and gross/net basis. Small samples stay clearly marked."
        badge="Analytics"
      />
      <AnalyticsTabs />

      <section className="analytics-section" aria-labelledby="distribution-heading">
        <div className="section-head">
          <div>
            <span className="section-head__eyebrow">Distribution</span>
            <h2 id="distribution-heading">Current salary ranges</h2>
            <p className="muted">
              Percentiles and averages per category and experience level. Calendar
              dates do not apply to this view.
            </p>
          </div>
          <span className="badge badge--muted">No date filter</span>
        </div>

        <form
          key={`dist:${distributionCategory}:${distributionExperience}`}
          className="card scope-form"
          onSubmit={handleDistributionSubmit}
        >
          <div className="scope-form__head">
            <div>
              <h2>Distribution scope</h2>
              <p className="muted">
                Optional filters. The backend only returns comparable salary groups.
              </p>
            </div>
          </div>

          <div className="scope-form__grid">
            <CategoryField
              categories={categories.data ?? []}
              defaultValue={distributionCategory}
              label="Category (optional)"
              name="distCategory"
            />
            <label className="field">
              <span>Experience level (optional)</span>
              <input
                type="text"
                name="distExperience"
                placeholder="e.g. SENIOR"
                defaultValue={distributionExperience}
              />
            </label>
          </div>

          <div className="scope-form__actions">
            <button className="btn" type="submit">
              Apply scope
            </button>
            <button
              className="btn btn--ghost"
              type="button"
              onClick={clearDistribution}
            >
              Clear
            </button>
          </div>
        </form>

        <DistributionResults
          categoryName={distributionCategory}
          experienceLevel={distributionExperience}
        />
      </section>

      <section className="analytics-section" aria-labelledby="salary-trend-heading">
        <div className="section-head">
          <div>
            <span className="section-head__eyebrow">Trend</span>
            <h2 id="salary-trend-heading">Monthly salary movement</h2>
            <p className="muted">
              A trend is scoped to one category, currency and employment type, so
              incompatible groups are never plotted on the same scale.
            </p>
          </div>
        </div>

        <DateRangeForm
          key={queryKey}
          initialFrom={range.from}
          initialTo={range.to}
          onApply={handleTrendApply}
        >
          <CategoryField
            categories={categories.data ?? []}
            defaultValue={trendCategory}
            label="Category"
            required
          />
          <label className="field">
            <span>Currency</span>
            <input
              type="text"
              name="currency"
              placeholder="e.g. PLN"
              list="currency-options"
              defaultValue={trendCurrency}
              required
            />
            <datalist id="currency-options">
              <option value="PLN" />
              <option value="EUR" />
              <option value="USD" />
              <option value="GBP" />
            </datalist>
          </label>
          <label className="field">
            <span>Employment type</span>
            <input
              type="text"
              name="employmentType"
              placeholder="e.g. B2B"
              list="employment-options"
              defaultValue={trendEmployment}
              required
            />
            <datalist id="employment-options">
              <option value="B2B" />
              <option value="UZ" />
              <option value="UOP" />
              <option value="CONTRACT" />
            </datalist>
          </label>
          <label className="field">
            <span>Salary type</span>
            <select name="salaryType" defaultValue={trendSalaryType}>
              <option value="GROSS">Gross</option>
              <option value="NET">Net</option>
            </select>
          </label>
          <label className="field">
            <span>Experience level (optional)</span>
            <input
              type="text"
              name="experienceLevel"
              placeholder="e.g. SENIOR"
              defaultValue={trendExperience}
            />
          </label>
        </DateRangeForm>

        {rangeError ? (
          <div className="state state--error" role="alert">
            <p className="state__title">Invalid date range</p>
            <p>{rangeError}</p>
          </div>
        ) : !hasTrendScope ? (
          <EmptyState
            title="Choose a trend scope"
            description="Select a category and enter currency and employment type to load a comparable monthly trend."
          />
        ) : (
          <SalaryTrendResults
            categoryName={trendCategory}
            currency={trendCurrency}
            employmentType={trendEmployment}
            salaryType={trendSalaryType}
            experienceLevel={trendExperience}
            dateFrom={range.from}
            dateTo={range.to}
          />
        )}
      </section>
    </div>
  )
}

interface DistributionResultsProps {
  categoryName: string
  experienceLevel: string
}

function DistributionResults({
  categoryName,
  experienceLevel,
}: DistributionResultsProps) {
  const salaries = useApiQuery(
    (signal) =>
      analyticsApi.salaries(
        {
          categoryName: categoryName || undefined,
          experienceLevel: experienceLevel || undefined,
        },
        signal,
      ),
    [categoryName, experienceLevel],
  )

  if (salaries.status === 'loading') {
    return <LoadingState label="Loading salary distribution…" />
  }

  if (salaries.status === 'error') {
    return <ErrorState error={salaries.error} onRetry={salaries.reload} />
  }

  if (!salaries.data) {
    return null
  }

  return (
    <DistributionContent
      data={salaries.data}
      categoryName={categoryName}
      experienceLevel={experienceLevel}
    />
  )
}

interface DistributionContentProps {
  data: SalaryAnalyticsTO
  categoryName: string
  experienceLevel: string
}

function DistributionContent({
  data,
  categoryName,
  experienceLevel,
}: DistributionContentProps) {
  const hasGroups =
    data.byCategory.length > 0 || data.byExperienceLevel.length > 0

  return (
    <>
      <div className="analytics-meta" aria-label="Distribution scope">
        <span className="tag">Category: {categoryName || 'all'}</span>
        <span className="tag">
          Experience level: {experienceLevel || 'all'}
        </span>
        <span className="tag">
          Recommended sample: {data.recommendedMinimumSampleSize}
        </span>
        {data.quantileMethod ? (
          <span className="tag">Quantiles: {data.quantileMethod}</span>
        ) : null}
        {data.salaryNormalizationVersion ? (
          <span className="tag">
            Salary normalisation: {data.salaryNormalizationVersion}
          </span>
        ) : null}
      </div>

      {!hasGroups ? (
        <EmptyState
          title="No comparable salary groups"
          description="No offers with usable salary data match this scope. Remove the filters or widen the dataset."
        />
      ) : (
        <>
          {data.byCategory.length > 0 ? (
            <section className="salary-block" aria-labelledby="by-category-heading">
              <div className="section-head section-head--compact">
                <div>
                  <h3 id="by-category-heading">By category</h3>
                  <p className="muted">
                    One card per category and salary context. Values are never
                    combined across currencies or salary types.
                  </p>
                </div>
                <span className="badge badge--muted">
                  {data.byCategory.length} group(s)
                </span>
              </div>
              <div className="salary-grid">
                {data.byCategory.map((statistic) => (
                  <SalaryCard
                    key={`${statistic.groupValue}:${statistic.currency}:${statistic.salaryUnit}:${statistic.employmentType}:${statistic.salaryType}`}
                    statistic={statistic}
                    recommendedMinimumSampleSize={data.recommendedMinimumSampleSize}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {data.byExperienceLevel.length > 0 ? (
            <section
              className="salary-block"
              aria-labelledby="by-experience-heading"
            >
              <div className="section-head section-head--compact">
                <div>
                  <h3 id="by-experience-heading">By experience level</h3>
                  <p className="muted">
                    Experience groups use the same per-card context and sample
                    rules.
                  </p>
                </div>
                <span className="badge badge--muted">
                  {data.byExperienceLevel.length} group(s)
                </span>
              </div>
              <div className="salary-grid">
                {data.byExperienceLevel.map((statistic) => (
                  <SalaryCard
                    key={`${statistic.groupValue}:${statistic.currency}:${statistic.salaryUnit}:${statistic.employmentType}:${statistic.salaryType}`}
                    statistic={statistic}
                    recommendedMinimumSampleSize={data.recommendedMinimumSampleSize}
                  />
                ))}
              </div>
            </section>
          ) : null}

          <p className="analytics-note">
            Share and count are not used here: salary statistics describe only
            offers with usable salary data. Groups below the recommended sample
            size are marked exploratory.
          </p>
        </>
      )}
    </>
  )
}

interface SalaryTrendResultsProps {
  categoryName: string
  currency: string
  employmentType: string
  salaryType: string
  experienceLevel: string
  dateFrom: string
  dateTo: string
}

function SalaryTrendResults({
  categoryName,
  currency,
  employmentType,
  salaryType,
  experienceLevel,
  dateFrom,
  dateTo,
}: SalaryTrendResultsProps) {
  const trend = useApiQuery(
    (signal) =>
      analyticsApi.salariesTrend(
        {
          categoryName,
          currency,
          employmentType,
          salaryType: salaryType === 'NET' ? 'NET' : 'GROSS',
          experienceLevel: experienceLevel || undefined,
          dateFrom,
          dateTo,
        },
        signal,
      ),
    [categoryName, currency, employmentType, salaryType, experienceLevel, dateFrom, dateTo],
  )

  if (trend.status === 'loading') {
    return <LoadingState label="Loading salary trend…" />
  }

  if (trend.status === 'error') {
    return <ErrorState error={trend.error} onRetry={trend.reload} />
  }

  if (!trend.data) {
    return null
  }

  return <SalaryTrendContent data={trend.data} />
}

function SalaryTrendContent({ data }: { data: SalaryTrendTO }) {
  const chartPoints = data.points.map((point) => ({
    key: point.month,
    label: formatMonth(point.month),
    value: point.medianSalary ?? 0,
    display:
      point.medianSalary == null ? '—' : formatNumber(point.medianSalary),
  }))

  return (
    <>
      <div className="analytics-meta" aria-label="Trend scope">
        <span className="tag tag--accent">{humanize(data.categoryName)}</span>
        <span className="tag">
          {data.currency} / {data.salaryUnit.toLowerCase()} ·{' '}
          {humanize(data.salaryType)}
        </span>
        <span className="tag">Employment: {data.employmentType}</span>
        <span className="tag">
          Experience: {data.experienceLevel || 'all'}
        </span>
        <span className="tag">{data.points.length} month(s)</span>
      </div>

      {data.points.length === 0 ? (
        <EmptyState
          title="No trend points"
          description="The backend returned no months for this scope."
        />
      ) : (
        <>
          <section className="card chart-card">
            <div className="chart-card__head">
              <div>
                <h2>Median salary by month</h2>
                <p className="muted">
                  {data.currency} / {data.salaryUnit.toLowerCase()} ·{' '}
                  {humanize(data.salaryType)} · {data.employmentType}
                  {data.experienceLevel
                    ? ` · ${humanize(data.experienceLevel)}`
                    : ''}
                </p>
              </div>
              <span className="badge badge--muted">Median</span>
            </div>
            <BarChart
              points={chartPoints}
              caption="Bars show median salary. Average salary and monthly sample size are in the table below; empty points are shown as a dash."
            />
          </section>

          <div className="card table-card">
            <div className="table-scroll" role="region" aria-label="Monthly salary trend data table" tabIndex={0}>
              <table className="data-table">
                <caption className="sr-only">
                  Monthly average and median salary for the selected scope
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Month</th>
                    <th scope="col" className="is-numeric">Average</th>
                    <th scope="col" className="is-numeric">Median</th>
                    <th scope="col" className="is-numeric">Offers</th>
                  </tr>
                </thead>
                <tbody>
                  {data.points.map((point) => (
                    <tr key={point.month}>
                      <th scope="row">{formatMonth(point.month)}</th>
                      <td className="is-numeric">
                        {point.averageSalary == null
                          ? '—'
                          : formatNumber(point.averageSalary)}
                      </td>
                      <td className="is-numeric is-strong">
                        {point.medianSalary == null
                          ? '—'
                          : formatNumber(point.medianSalary)}
                      </td>
                      <td className="is-numeric is-muted">
                        {point.offersCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="analytics-note">
            Monthly groups can be smaller than the distribution sample. Check the
            offer count before treating a movement as a trend.
          </p>
        </>
      )}
    </>
  )
}
