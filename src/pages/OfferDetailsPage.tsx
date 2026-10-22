import { useParams } from 'react-router-dom'
import { PlannedPage } from '../components/PlannedPage'

export function OfferDetailsPage() {
  const { offerId } = useParams<{ offerId: string }>()

  return (
    <PlannedPage
      milestone="M2"
      title={offerId ? `Offer ${offerId}` : 'Offer details'}
      description="A single persisted offer, including optional fields that must not break rendering."
      items={[
        'Direct navigation to /offers/{id} works without visiting the list first',
        'Absent offers show a user-facing 404 state, not a raw error',
        'Nullable salary, city, category and technology fields render safely',
      ]}
    />
  )
}
