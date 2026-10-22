import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'

const views = [
  {
    to: '/analytics/technologies',
    title: 'Technology popularity',
    description: 'Count, denominator and share per technology for the selected scope.',
  },
  {
    to: '/analytics/technologies/trend',
    title: 'Technology trend',
    description: 'Monthly counts with zero months preserved and no count/share conflation.',
  },
  {
    to: '/analytics/salaries',
    title: 'Salary distribution and trend',
    description: 'Currency, salary unit, employment type, gross/net, sample size and exploratory status.',
  },
  {
    to: '/analytics/completeness',
    title: 'Source data completeness',
    description: 'Eligibility and usability percentages per source for the selected period.',
  },
]

export function AnalyticsLandingPage() {
  return (
    <div className="page">
      <PageHeader
        title="Analytics"
        description="Explore the aggregated dataset. Every view states its scope, denominators and units."
        badge="Planned · M3"
      />

      <div className="card-grid">
        {views.map((view) => (
          <article className="card card--link" key={view.to}>
            <h2>
              <Link to={view.to}>{view.title}</Link>
            </h2>
            <p className="muted">{view.description}</p>
          </article>
        ))}
      </div>

      <p className="muted">
        Analytics date ranges are inclusive YYYY-MM-DD values. Invalid or inverted
        ranges will be blocked before a request is sent (FE-015).
      </p>
    </div>
  )
}
