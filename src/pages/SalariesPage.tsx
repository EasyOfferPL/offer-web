import { PlannedPage } from '../components/PlannedPage'

export function SalariesPage() {
  return (
    <PlannedPage
      milestone="M3"
      title="Salary distribution and trend"
      description="GET /v1.0/analytics/salaries and GET /v1.0/analytics/salaries/trend"
      items={[
        'Currency, salary unit, employment type and gross/net are always visible',
        'Sample size and exploratory status are shown next to the numbers',
        'Incompatible salary groups are never mixed in one chart',
        'Null and empty points render safely',
      ]}
    />
  )
}
