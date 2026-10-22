import { Link } from 'react-router-dom'
import type { OfferResponseTO } from '../api/types'
import { formatDate, formatSalary, humanize } from '../lib/format'

interface OfferCardProps {
  offer: OfferResponseTO
}

export function OfferCard({ offer }: OfferCardProps) {
  const place = [offer.companyName, offer.location].filter(Boolean).join(' · ')
  const meta = [offer.experienceLevel, offer.employmentType, offer.workMode]
    .filter(Boolean)
    .map((value) => humanize(value))
    .join(' · ')

  return (
    <article className="card offer-card">
      <div className="offer-card__head">
        <h2>
          <Link to={`/offers/${offer.id}`}>{offer.title}</Link>
        </h2>
        {offer.source ? <span className="badge badge--muted">{offer.source}</span> : null}
      </div>

      <p className="muted">{place || 'Company and location not specified'}</p>
      <p className="offer-card__salary">{formatSalary(offer)}</p>

      {offer.technologies && offer.technologies.length > 0 ? (
        <ul className="chips" aria-label="Technologies">
          {offer.technologies.slice(0, 10).map((technology) => (
            <li key={technology}>{technology}</li>
          ))}
        </ul>
      ) : null}

      <p className="muted offer-card__meta">
        {meta ? <span>{meta}</span> : null}
        {meta && offer.publishedAt ? <span aria-hidden="true"> · </span> : null}
        {offer.publishedAt ? <span>published {formatDate(offer.publishedAt)}</span> : null}
      </p>
    </article>
  )
}
