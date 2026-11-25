import { Link, useParams } from 'react-router-dom'
import { offersApi } from '../api/endpoints'
import { ApiError } from '../api/errors'
import type { OfferResponseTO } from '../api/types'
import { ErrorState, LoadingState } from '../components/AsyncStates'
import { useApiQuery } from '../hooks/useApiQuery'
import { formatDate, formatSalary, humanize } from '../lib/format'

interface MetaItem {
  label: string
  value: string
}

function OfferDetails({ offer }: { offer: OfferResponseTO }) {
  const place = [offer.companyName, offer.location].filter(Boolean).join(' · ')
  const externalUrl =
    offer.url && /^https?:\/\//i.test(offer.url) ? offer.url : undefined
  const companyInitial = (offer.companyName ?? '?').trim().charAt(0).toUpperCase() || '?'

  const meta: MetaItem[] = [
    { label: 'Experience', value: humanize(offer.experienceLevel) },
    { label: 'Employment', value: humanize(offer.employmentType) },
    { label: 'Work mode', value: humanize(offer.workMode) },
    { label: 'Language', value: humanize(offer.language) },
    { label: 'Salary type', value: humanize(offer.salaryType) },
  ].filter((item) => item.value !== '—')

  return (
    <div className="page">
      <section className="card offer-hero">
        <div className="offer-hero__main">
          <span className="offer-hero__avatar" aria-hidden="true">
            {companyInitial}
          </span>
          <div className="offer-hero__text">
            <div className="offer-hero__badges">
              {offer.source ? <span className="badge">{humanize(offer.source)}</span> : null}
              {offer.publishedAt ? (
                <span className="badge badge--muted">
                  Published {formatDate(offer.publishedAt)}
                </span>
              ) : null}
            </div>
            <h1 className="offer-hero__title">{offer.title}</h1>
            <p className="offer-hero__place">
              {place || 'Company and location not specified'}
            </p>
          </div>
        </div>

        <div className="offer-hero__aside">
          <div className="offer-hero__salary">
            <span className="offer-hero__salary-label">Salary</span>
            <span className="offer-hero__salary-value">{formatSalary(offer)}</span>
          </div>
          {externalUrl ? (
            <a
              className="btn"
              href={externalUrl}
              target="_blank"
              rel="noreferrer noopener"
            >
              Open original posting
            </a>
          ) : null}
        </div>
      </section>

      {meta.length > 0 ? (
        <section className="offer-meta" aria-label="Job details">
          {meta.map((item) => (
            <div className="offer-meta__item" key={item.label}>
              <span className="offer-meta__label">{item.label}</span>
              <span className="offer-meta__value">{item.value}</span>
            </div>
          ))}
        </section>
      ) : null}

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

      <section className="card description-card">
        <div className="description-card__header">
          <div>
            <h2>Description</h2>
            {place ? (
              <p className="description-card__subtitle">{place}</p>
            ) : null}
          </div>
        </div>

        <div className="description-body">
          {offer.description?.trim() ? (
            <p>{offer.description.trim()}</p>
          ) : (
            <div className="description-empty">
              <span className="description-empty__icon" aria-hidden="true">≡</span>
              <div>
                <p className="description-empty__title">
                  No description provided
                </p>
                <p className="muted description-empty__text">
                  The source did not publish a description for this offer. Open the
                  original posting for the full details.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="offer-details__footer">
        <Link className="btn btn--ghost" to="/offers">
          <span aria-hidden="true">←</span> Back to offers
        </Link>
      </div>
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
