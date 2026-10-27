import { Link, useParams } from 'react-router-dom'
import { offersApi } from '../api/endpoints'
import { ApiError } from '../api/errors'
import type { OfferResponseTO } from '../api/types'
import { ErrorState, LoadingState } from '../components/AsyncStates'
import { PageHeader } from '../components/PageHeader'
import { useApiQuery } from '../hooks/useApiQuery'
import { formatDate, formatDateTime, formatSalary, humanize } from '../lib/format'

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value || '—'}</dd>
    </div>
  )
}

function OfferDetails({ offer }: { offer: OfferResponseTO }) {
  const place = [offer.companyName, offer.location].filter(Boolean).join(' · ')
  const externalUrl =
    offer.url && /^https?:\/\//i.test(offer.url) ? offer.url : undefined

  return (
    <div className="page">
      <PageHeader
        title={offer.title}
        description={place || 'Company and location not specified'}
        badge={offer.source ?? undefined}
        actions={
          externalUrl ? (
            <a
              className="btn"
              href={externalUrl}
              target="_blank"
              rel="noreferrer noopener"
            >
              Open original posting
            </a>
          ) : undefined
        }
      />

      <section className="card">
        <h2>Overview</h2>
        <dl className="detail-grid">
          <DetailRow label="Salary" value={formatSalary(offer)} />
          <DetailRow label="Salary type" value={humanize(offer.salaryType)} />
          <DetailRow label="Experience" value={humanize(offer.experienceLevel)} />
          <DetailRow label="Employment" value={humanize(offer.employmentType)} />
          <DetailRow label="Work mode" value={humanize(offer.workMode)} />
          <DetailRow label="Language" value={humanize(offer.language)} />
          <DetailRow label="Source" value={humanize(offer.source)} />
          <DetailRow label="Source ID" value={offer.externalId ?? '—'} />
          <DetailRow label="Published" value={formatDate(offer.publishedAt)} />
          <DetailRow label="Created" value={formatDateTime(offer.createdAt)} />
          <DetailRow label="Updated" value={formatDateTime(offer.updatedAt)} />
        </dl>
      </section>

      {offer.technologies && offer.technologies.length > 0 ? (
        <section className="card">
          <h2>Technologies</h2>
          <ul className="chips">
            {offer.technologies.map((technology) => (
              <li key={technology}>{technology}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="card">
        <h2>Description</h2>
        <p className="description">
          {offer.description?.trim() || 'No description was provided by the source.'}
        </p>
      </section>

      <p>
        <Link className="back-link" to="/offers">← Back to offers</Link>
      </p>
    </div>
  )
}

function OfferMissing({ offerId }: { offerId: string }) {
  return (
    <div className="page">
      <div className="card">
        <p className="badge">404</p>
        <h1>Offer not found</h1>
        <p className="muted">
          No offer with id <code>{offerId || '—'}</code> exists in the dataset. It may
          have been removed, or the link may be incorrect.
        </p>
        <Link className="back-link" to="/offers">Back to the offer list</Link>
      </div>
    </div>
  )
}

function OfferDetailsContent({ offerId }: { offerId: string }) {
  const offer = useApiQuery((signal) => offersApi.byId(offerId, signal), [offerId])

  if (offer.status === 'loading') {
    return <LoadingState label={`Loading offer ${offerId}…`} />
  }

  if (offer.status === 'error') {
    if (offer.error instanceof ApiError && offer.error.status === 404) {
      return <OfferMissing offerId={offerId} />
    }
    return <ErrorState error={offer.error} onRetry={offer.reload} />
  }

  if (!offer.data) {
    return <OfferMissing offerId={offerId} />
  }

  return <OfferDetails offer={offer.data} />
}

export function OfferDetailsPage() {
  const { offerId = '' } = useParams<{ offerId: string }>()

  if (!/^\d+$/.test(offerId)) {
    return <OfferMissing offerId={offerId} />
  }

  return <OfferDetailsContent offerId={offerId} />
}
