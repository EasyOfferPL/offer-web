import { PlannedPage } from '../components/PlannedPage'

export function OffersPage() {
  return (
    <PlannedPage
      milestone="M2"
      title="Offers"
      description="Browse, filter and open persisted job offers from the EasyOffer backend."
      items={[
        'Paged list backed by GET /offers and the stable PageResponseTO wrapper',
        'Zero-based page state with working first/last controls and an empty result',
        'Conjunctive filters from GET /offers/search and categories from GET /v1.0/categories',
        'Filter state kept in the URL; changing a filter resets the page',
        'Details view from GET /offers/{id} with a user-facing 404 state',
      ]}
    />
  )
}
