export interface BarPoint {
  key: string
  label: string
  value: number
  /** Pre-formatted value shown above the bar. */
  display: string
}

interface BarChartProps {
  points: BarPoint[]
  caption: string
}

/**
 * Lightweight CSS bar chart. It is intentionally decorative: the same values
 * are always rendered in an accessible table next to the chart.
 */
export function BarChart({ points, caption }: BarChartProps) {
  const max = Math.max(...points.map((point) => point.value), 1)

  return (
    <figure className="chart">
      <div className="chart__plot" aria-hidden="true">
        {points.map((point) => {
          const height =
            point.value > 0 ? Math.max((point.value / max) * 100, 3) : 1.5

          return (
            <div className="chart__col" key={point.key}>
              <span className="chart__value">{point.display}</span>
              <span className="chart__bar" style={{ height: `${height}%` }} />
              <span className="chart__label">{point.label}</span>
            </div>
          )
        })}
      </div>
      <figcaption>{caption}</figcaption>
    </figure>
  )
}
