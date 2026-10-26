import type { SalaryStatisticTO } from '../../api/types'
import { clampPercentage } from '../../lib/analytics'
import { formatNumber, humanize } from '../../lib/format'

interface SalaryCardProps {
  statistic: SalaryStatisticTO
  recommendedMinimumSampleSize: number
}

/**
 * One salary group is always one comparable scope: currency, unit, employment
 * type and gross/net are printed on the card and never combined with another
 * group in a single visual scale.
 */
export function SalaryCard({
  statistic,
  recommendedMinimumSampleSize,
}: SalaryCardProps) {
  const {
    minimumSalary: minimum,
    percentile25Salary: p25,
    medianSalary: median,
    percentile75Salary: p75,
    maximumSalary: maximum,
  } = statistic

  const span = Math.max(maximum - minimum, 1)
  const bandLeft = clampPercentage(((p25 - minimum) / span) * 100)
  const bandWidth = Math.max(clampPercentage(((p75 - p25) / span) * 100), 2)
  const markerLeft = clampPercentage(((median - minimum) / span) * 100)

  return (
    <article className="card salary-card">
      <header className="salary-card__head">
        <div>
          <h3>{humanize(statistic.groupValue)}</h3>
          <p className="muted">
            {statistic.offersCount} offer(s) · {statistic.salaryUnit.toLowerCase()} ·{' '}
            {humanize(statistic.salaryType)}
          </p>
        </div>
        <span
          className={`badge ${statistic.meetsRecommendedSampleSize ? 'badge--ok' : 'badge--warn'}`}
        >
          {statistic.meetsRecommendedSampleSize ? 'Adequate sample' : 'Exploratory'}
        </span>
      </header>

      <div className="salary-card__figure">
        <span className="salary-card__figure-label">Median</span>
        <p className="salary-card__median">
          {formatNumber(median)}{' '}
          <span>
            {statistic.currency} / {statistic.salaryUnit.toLowerCase()}
          </span>
        </p>
      </div>

      <div className="salary-range">
        <div className="salary-range__track" aria-hidden="true">
          <span
            className="salary-range__band"
            style={{ left: `${bandLeft}%`, width: `${bandWidth}%` }}
          />
          <span
            className="salary-range__marker"
            style={{ left: `${markerLeft}%` }}
          />
        </div>
        <div className="salary-range__labels">
          <span>{formatNumber(minimum)}</span>
          <span>P25–P75</span>
          <span>{formatNumber(maximum)}</span>
        </div>
      </div>

      <dl className="salary-card__stats">
        <div>
          <dt>Average</dt>
          <dd>{formatNumber(statistic.averageSalary)}</dd>
        </div>
        <div>
          <dt>P25</dt>
          <dd>{formatNumber(p25)}</dd>
        </div>
        <div>
          <dt>Median</dt>
          <dd>{formatNumber(median)}</dd>
        </div>
        <div>
          <dt>P75</dt>
          <dd>{formatNumber(p75)}</dd>
        </div>
      </dl>

      <p className="salary-card__scope">
        {statistic.currency} · {statistic.salaryUnit} · {statistic.employmentType}{' '}
        · {humanize(statistic.salaryType)}
      </p>

      <p className="salary-card__note">
        {statistic.meetsRecommendedSampleSize
          ? `Sample meets the recommended minimum of ${recommendedMinimumSampleSize}.`
          : `Fewer than ${recommendedMinimumSampleSize} offers; treat as exploratory.`}
      </p>
    </article>
  )
}
