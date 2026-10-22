import { PlannedPage } from '../components/PlannedPage'

export function TechnologyTrendPage() {
  return (
    <PlannedPage
      milestone="M3"
      title="Technology trend"
      description="GET /v1.0/analytics/technologies/trend"
      items={[
        'Selected technology and period are visible',
        'Months without data are preserved as zero',
        'Count and share are never conflated',
      ]}
    />
  )
}
