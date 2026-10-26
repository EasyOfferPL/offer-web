import { useState, type FormEvent, type ReactNode } from 'react'
import {
  currentYearRange,
  lastDaysRange,
  validateRange,
  type DateRange,
} from '../../lib/analytics'

interface DateRangeFormProps {
  /** Initial values; remount the form (for example with a URL key) to update them. */
  initialFrom: string
  initialTo: string
  onApply: (range: DateRange, values: Record<string, string>) => void
  children?: ReactNode
  applyLabel?: string
}

/**
 * Shared inclusive calendar scope control for every analytics screen.
 *
 * The range is validated before `onApply` is called, so an inverted or partial
 * range can never reach the API. Extra scope fields are rendered inside the
 * same form and returned as trimmed strings.
 */
export function DateRangeForm({
  initialFrom,
  initialTo,
  onApply,
  children,
  applyLabel = 'Apply scope',
}: DateRangeFormProps) {
  const [from, setFrom] = useState(initialFrom)
  const [to, setTo] = useState(initialTo)
  const [error, setError] = useState<string | null>(null)

  function applyPreset(range: DateRange) {
    setFrom(range.from)
    setTo(range.to)
    setError(null)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const message = validateRange(from, to)
    setError(message)

    if (message) {
      return
    }

    const formData = new FormData(event.currentTarget)
    const values: Record<string, string> = {}

    formData.forEach((rawValue, key) => {
      if (key === 'dateFrom' || key === 'dateTo') {
        return
      }
      const value = String(rawValue).trim()
      if (value) {
        values[key] = value
      }
    })

    onApply({ from, to }, values)
  }

  return (
    <form className="card scope-form" onSubmit={handleSubmit}>
      <div className="scope-form__head">
        <div>
          <h2>Scope</h2>
          <p className="muted">
            Inclusive calendar dates (YYYY-MM-DD). Validation runs before any request.
          </p>
        </div>
        <div className="scope-form__presets" aria-label="Date range presets">
          <button
            type="button"
            className="preset"
            onClick={() => applyPreset(lastDaysRange(30))}
          >
            Last 30 days
          </button>
          <button
            type="button"
            className="preset"
            onClick={() => applyPreset(lastDaysRange(90))}
          >
            Last 90 days
          </button>
          <button
            type="button"
            className="preset"
            onClick={() => applyPreset(currentYearRange())}
          >
            This year
          </button>
        </div>
      </div>

      <div className="scope-form__grid">
        <label className="field">
          <span>From</span>
          <input
            type="date"
            name="dateFrom"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
            required
          />
        </label>

        <label className="field">
          <span>To</span>
          <input
            type="date"
            name="dateTo"
            value={to}
            onChange={(event) => setTo(event.target.value)}
            required
          />
        </label>

        {children}
      </div>

      <div className="scope-form__actions">
        <button className="btn" type="submit">
          {applyLabel}
        </button>
      </div>

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
    </form>
  )
}
