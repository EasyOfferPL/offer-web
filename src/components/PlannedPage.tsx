import { Link } from 'react-router-dom'
import { PageHeader } from './PageHeader'

interface PlannedPageProps {
  milestone: string
  title: string
  description: string
  items: string[]
}

/**
 * Placeholder used in M1 so every route renders and can be reviewed
 * before the real views exist. Removed as each milestone lands.
 */
export function PlannedPage({ milestone, title, description, items }: PlannedPageProps) {
  return (
    <div className="page">
      <PageHeader
        title={title}
        description={description}
        badge={`Planned · ${milestone}`}
      />

      <section className="card">
        <h2>Acceptance criteria</h2>
        <ul className="checklist">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <p className="muted">
        This route is a placeholder created in M1 so navigation and layout can be
        reviewed without backend data. The real view ships in {milestone}.
      </p>

      <p>
        <Link to="/offers">Back to offers</Link>
      </p>
    </div>
  )
}
