import { PlannedPage } from '../components/PlannedPage'

export function TechnologyPopularityPage() {
  return (
    <PlannedPage
      milestone="M3"
      title="Technology popularity"
      description="GET /v1.0/analytics/technologies/popularity"
      items={[
        'Count, denominator and share are labelled separately',
        'Source, date range and category scope are visible',
        'Backend pagination is supported',
      ]}
    />
  )
}
