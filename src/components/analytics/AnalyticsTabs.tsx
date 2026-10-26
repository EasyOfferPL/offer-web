import { NavLink } from 'react-router-dom'

const tabs = [
  { to: '/analytics', label: 'Overview', end: true },
  { to: '/analytics/technologies', label: 'Technologies', end: true },
  { to: '/analytics/technologies/trend', label: 'Trends', end: true },
  { to: '/analytics/salaries', label: 'Salaries', end: true },
  { to: '/analytics/completeness', label: 'Completeness', end: true },
]

export function AnalyticsTabs() {
  return (
    <nav className="subnav" aria-label="Analytics views">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) => `subnav__link${isActive ? ' is-active' : ''}`}
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  )
}
