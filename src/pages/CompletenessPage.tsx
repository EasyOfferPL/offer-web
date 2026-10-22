import { PlannedPage } from '../components/PlannedPage'

export function CompletenessPage() {
  return (
    <PlannedPage
      milestone="M3"
      title="Source data completeness"
      description="GET /v1.0/analytics/data-completeness"
      items={[
        'Field eligibility and usability percentages are labelled per source',
        'The selected acquisition period is visible',
        'Missing or partial sources do not break the view',
      ]}
    />
  )
}
