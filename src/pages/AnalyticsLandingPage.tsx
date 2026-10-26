import { Link } from 'react-router-dom'
import { analyticsApi } from '../api/endpoints'
import type { AnalyticsTO } from '../api/types'
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncStates'
import { PageHeader } from '../components/PageHeader'
import { AnalyticsTabs } from '../components/analytics/AnalyticsTabs'
import { useApiQuery } from '../hooks/useApiQuery'
import { formatDate, humanize } from '../lib/format'

const views = [
  {
    to: '/analytics/technologies',
    number: '01',
    title: 'Technology popularity',
    description:
      'Count, denominator and share per technology for the selected scope.',
    tags: ['Paged', 'Share'],
  },
  {
    to: '/analytics/technologies/trend',
    number: '02',
    title: 'Technology trend',
    description:
      'Monthly counts with zero months preserved and no count/share conflation.',
    tags: ['Monthly', 'Zero-safe'],
  },
  {
    to: '/analytics/salaries',
    number: '03',
    title: 'Salary distribution and trend',
    description:
      'Currency, salary unit, employment type, gross/net, sample size and exploratory status.',
    tags: ['Comparable groups', 'Sample size'],
  },
  {
    to: '/analytics/completeness',
    number: '04',
    title: 'Source data completeness',
    description:
      'Eligibility and usability percentages per source for the selected period.',
    tags: ['Per source', 'Per field'],
  },
]

export function AnalyticsLandingPage() {
  return (
    <div className="page">
      <PageHeader
        title="Analytics"
        description="Explore the aggregated dataset. Every view states its scope, denominators and units."
        badge="Analytics"
      />
      <AnalyticsTabs />

      <DashboardSnapshot />

      <section aria-labelledby="analytics-views-heading">
        <div className="section-head">
          <div>
            <span className="section-head__eyebrow">Views</span>
            <h2 id="analytics-views-heading">Choose a question</h2>
            <p className="muted">
              Each view keeps its filters in the URL and validates the date range
              before calling the API.
            </p>
          </div>
        </div>

        <div className="view-grid">
          {views.map((view) => (
            <article className="card card--link view-card" key={view.to}>
              <span className="view-card__number">{view.number}</span>
              <h2>
                <Link to={view.to}>{view.title}</Link>
              </h2>
              <p className="muted">{view.description}</p>
              <ul className="chips view-card__tags" aria-label="View properties">
                {view.tags.map((tag) => (
                  <li key={tag}>{tag}</li>
                ))}
              </ul>
              <span className="view-card__cta">Open view →</span>
            </article>
          ))}
        </div>
      </section>

      <section className="card landing-notes" aria-labelledby="scope-rules-heading">
        <h2 id="scope-rules-heading">How to read these numbers</h2>
        <ul className="checklist">
          <li>Calendar ranges are inclusive ISO dates (YYYY-MM-DD).</li>
          <li>
            Counts and shares are labelled separately; the denominator is always
            visible.
          </li>
          <li>
            Salary groups keep currency, unit, employment type and gross/net; small
            samples are marked exploratory.
          </li>
          <li>
            Technology trends preserve zero months and use the publication month
            reported by the backend.
          </li>
        </ul>
      </section>
    </div>
  )
}

function DashboardSnapshot() {
  const dashboard = useApiQuery((signal) => analyticsApi.dashboard(signal), [])

  if (dashboard.status === 'loading') {
    return <LoadingState label="Loading dataset snapshot…" />
  }

  if (dashboard.status === 'error') {
    return (
      <section className="card">
        <h2>Dataset snapshot</h2>
        <ErrorState error={dashboard.error} onRetry={dashboard.reload} />
      </section>
    )
  }

  if (!dashboard.data) {
    return null
  }

  return <SnapshotContent data={dashboard.data} />
}

function SnapshotContent({ data }: { data: AnalyticsTO }) {
  const categoryTotal = data.categoriesStatistic.reduce(
    (sum, category) => sum + category.offersCount,
    0,
  )
  const maxCategory = Math.max(
    ...data.categoriesStatistic.map((category) => category.offersCount),
    1,
  )

  return (
    <section aria-labelledby="snapshot-heading">
      <div className="section-head">
        <div>
          <span className="section-head__eyebrow">Snapshot</span>
          <h2 id="snapshot-heading">Dataset overview</h2>
          <p className="muted">
            Counts from the public analytics summary, with links into the offer
            dataset.
          </p>
        </div>
        <span className="badge badge--muted">
          {categoryTotal} counted offer(s)
        </span>
      </div>

      <div className="snapshot-grid">
        <div className="card snapshot-card">
          <div className="snapshot-card__head">
            <h3>Offers by category</h3>
            <Link className="text-link" to="/offers">
              Browse all
            </Link>
          </div>

          {data.categoriesStatistic.length === 0 ? (
            <EmptyState
              title="No category counts"
              description="The analytics summary returned no categories."
            />
          ) : (
            <ul className="rank-list">
              {data.categoriesStatistic.map((category) => (
                <li key={category.categoryName} className="rank-row">
                  <div className="rank-row__head">
                    <Link
                      className="rank-row__label"
                      to={`/offers?categoryNames=${encodeURIComponent(category.categoryName)}`}
                    >
                      {humanize(category.categoryName)}
                    </Link>
                    <span className="rank-row__value">
                      {category.offersCount}
                    </span>
                  </div>
                  <div className="rank-bar" aria-hidden="true">
                    <span
                      style={{
                        width:
                          category.offersCount > 0
                            ? `${Math.max((category.offersCount / maxCategory) * 100, 2)}%`
                            : '0%',
                      }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="card snapshot-card">
          <div className="snapshot-card__head">
            <h3>Newest offers</h3>
            <Link className="text-link" to="/offers">
              See all
            </Link>
          </div>

          {data.newestJobOffers.length === 0 ? (
            <EmptyState
              title="No recent offers"
              description="The analytics summary returned no newest offers."
            />
          ) : (
            <ul className="recent-list">
              {data.newestJobOffers.map((offer) => (
                <li key={offer.id} className="recent-row">
                  <div className="recent-row__main">
                    <Link to={`/offers/${offer.id}`}>{offer.title}</Link>
                    <p className="muted">
                      {offer.companyName || 'Unknown company'}
                      {offer.location ? ` · ${offer.location}` : ''}
                    </p>
                  </div>
                  <span className="recent-row__date">
                    {formatDate(offer.publishedAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}
