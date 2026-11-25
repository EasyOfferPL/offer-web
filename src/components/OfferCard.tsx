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
  const companyInitial = (offer.companyName ?? '?').trim().charAt(0).toUpperCase() || '?'

  return (
    <article className="card offer-card">
      <Link className="offer-card__link" to={`/offers/${offer.id}`} aria-label={`Open ${offer.title}`}>
        <div className="offer-card__top">
          <div className="offer-card__identity">
            <span className="offer-card__avatar" aria-hidden="true">
              {companyInitial}
            </span>
            <div className="offer-card__heading">
              <h2 className="offer-card__title">{offer.title}</h2>
              <p className="offer-card__place">{place || 'Company and location not specified'}</p>
            </div>
          </div>
          {offer.source ? <span className="badge badge--muted">{offer.source}</span> : null}
        </div>

        <div className="offer-card__salary-row">
          <span className="offer-card__salary-label">Salary</span>
          <span className="offer-card__salary">{formatSalary(offer)}</span>
        </div>

        {offer.technologies && offer.technologies.length > 0 ? (
          <ul className="chips offer-card__chips" aria-label="Technologies">
            {offer.technologies.slice(0, 10).map((technology) => (
              <li key={technology}>{technology}</li>
            ))}
          </ul>
        ) : null}

        <div className="offer-card__bottom">
          <div className="offer-card__meta">
            {meta.map((item) => (
              <span className="offer-card__meta-pill" key={item}>
                {item}
              </span>
            ))}
            {offer.publishedAt ? <span>published {formatDate(offer.publishedAt)}</span> : null}
          </div>
          <span className="offer-card__arrow" aria-hidden="true">→</span>
        </div>
      </Link>
    </article>
  )
}
