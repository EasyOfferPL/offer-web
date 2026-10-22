import type { OfferResponseTO, SalaryType } from '../api/types'

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 0,
})

const SALARY_TYPE_LABELS: Record<SalaryType, string> = {
  GROSS: 'gross',
  NET: 'net',
  UNKNOWN: '',
}

function toDate(value: string): Date | null {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDate(value?: string | null): string {
  if (!value) {
    return '—'
  }
  const date = toDate(value)
  return date ? dateFormatter.format(date) : value
}

export function formatDateTime(value?: string | null): string {
  if (!value) {
    return '—'
  }
  const date = toDate(value)
  return date ? dateTimeFormatter.format(date) : value
}

export function formatNumber(value: number): string {
  return numberFormatter.format(value)
}

export function formatSalary(
  offer: Pick<
    OfferResponseTO,
    'salaryMin' | 'salaryMax' | 'currency' | 'salaryUnit' | 'salaryType'
  >,
): string {
  const { salaryMin: min, salaryMax: max } = offer

  if (min == null && max == null) {
    return 'Salary not disclosed'
  }

  let range: string
  if (min != null && max != null) {
    range = min === max ? formatNumber(min) : `${formatNumber(min)} – ${formatNumber(max)}`
  } else {
    range = formatNumber((min ?? max) as number)
  }

  const parts = [range]
  if (offer.currency) {
    parts.push(offer.currency)
  }
  if (offer.salaryUnit) {
    parts.push(`/ ${offer.salaryUnit.toLowerCase()}`)
  }

  const salaryType = offer.salaryType ? SALARY_TYPE_LABELS[offer.salaryType] : ''
  if (salaryType) {
    parts.push(`(${salaryType})`)
  }

  return parts.join(' ')
}

/** Turns backend enum-like strings (JUST_JOIN_IT, B2B, en) into readable labels. */
export function humanize(value?: string | null): string {
  if (!value) {
    return '—'
  }
  if (value.length <= 3) {
    return value.toUpperCase()
  }
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}
