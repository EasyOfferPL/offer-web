/**
 * Shared helpers for analytics screens.
 *
 * Calendar parameters are inclusive ISO dates (YYYY-MM-DD); offer timestamp
 * filters use ISO date-time and are handled elsewhere. Ranges are compared as
 * strings, which is safe for this format.
 */

export interface DateRange {
  from: string
  to: string
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

export function toIsoDate(date: Date): string {
  const year = date.getFullYear()
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function todayIso(): string {
  return toIsoDate(new Date())
}

export function currentYearRange(): DateRange {
  const now = new Date()
  return { from: `${now.getFullYear()}-01-01`, to: toIsoDate(now) }
}

export function lastDaysRange(days: number): DateRange {
  const to = new Date()
  const from = new Date(to)
  from.setDate(from.getDate() - (days - 1))
  return { from: toIsoDate(from), to: toIsoDate(to) }
}

export function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE.test(value)) {
    return false
  }

  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  )
}

export function validateRange(from: string, to: string): string | null {
  if (!from || !to) {
    return 'Choose both a start and an end date.'
  }
  if (!isValidIsoDate(from) || !isValidIsoDate(to)) {
    return 'Dates must use the YYYY-MM-DD format.'
  }
  if (from > to) {
    return 'The start date must be on or before the end date.'
  }
  return null
}

/**
 * Reads the range from the URL. Missing values fall back to the current year;
 * invalid values are reported and the caller must not send a request.
 */
export function resolveRange(params: URLSearchParams): {
  range: DateRange
  error: string | null
} {
  const fallback = currentYearRange()
  const range = {
    from: params.get('dateFrom') ?? fallback.from,
    to: params.get('dateTo') ?? fallback.to,
  }

  return { range, error: validateRange(range.from, range.to) }
}

/** Accepts comma/space separated source names and normalises them to uppercase. */
export function parseSourceList(value?: string | null): string[] {
  if (!value) {
    return []
  }

  return [
    ...new Set(
      value
        .split(/[\s,]+/)
        .map((source) => source.trim().toUpperCase())
        .filter(Boolean),
    ),
  ]
}

export function formatMonth(value: string): string {
  const [year, month] = value.split('-').map(Number)
  if (!year || !month) {
    return value
  }
  return new Intl.DateTimeFormat('en-GB', {
    month: 'short',
    year: '2-digit',
  }).format(new Date(year, month - 1, 1))
}

const shareFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 1,
})

export function formatShare(value?: number | null): string {
  return value == null ? '—' : `${shareFormatter.format(value)}%`
}

export function clampPercentage(value: number): number {
  if (!Number.isFinite(value)) {
    return 0
  }
  return Math.min(Math.max(value, 0), 100)
}

export function parsePositiveInt(
  value: string | null,
  fallback: number,
  allowed?: readonly number[],
): number {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 0) {
    return fallback
  }
  if (allowed && !allowed.includes(parsed)) {
    return fallback
  }
  return parsed
}
