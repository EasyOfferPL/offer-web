import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clampPercentage,
  currentYearRange,
  formatMonth,
  formatShare,
  isValidIsoDate,
  lastDaysRange,
  parsePositiveInt,
  parseSourceList,
  resolveRange,
  toIsoDate,
  validateRange,
} from './analytics'

describe('calendar helpers', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 2, 31, 12, 0, 0))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('round-trips local dates as ISO calendar dates', () => {
    expect(toIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05')
  })

  it('accepts real leap days and rejects impossible dates', () => {
    expect(isValidIsoDate('2024-02-29')).toBe(true)
    expect(isValidIsoDate('2026-02-29')).toBe(false)
    expect(isValidIsoDate('2026-04-31')).toBe(false)
    expect(isValidIsoDate('2026-1-01')).toBe(false)
    expect(isValidIsoDate('')).toBe(false)
  })

  it('validates missing, malformed, inverted and equal ranges', () => {
    expect(validateRange('', '2026-01-01')).toBe(
      'Choose both a start and an end date.',
    )
    expect(validateRange('2026-13-01', '2026-12-01')).toBe(
      'Dates must use the YYYY-MM-DD format.',
    )
    expect(validateRange('2026-02-02', '2026-02-01')).toBe(
      'The start date must be on or before the end date.',
    )
    expect(validateRange('2026-02-01', '2026-02-01')).toBeNull()
    expect(validateRange('2026-01-01', '2026-02-01')).toBeNull()
  })

  it('builds the current-year and inclusive relative ranges', () => {
    expect(currentYearRange()).toEqual({ from: '2026-01-01', to: '2026-03-31' })
    expect(lastDaysRange(30)).toEqual({ from: '2026-03-02', to: '2026-03-31' })
    expect(lastDaysRange(1)).toEqual({ from: '2026-03-31', to: '2026-03-31' })
  })

  it('falls back to the current year when URL dates are absent', () => {
    expect(resolveRange(new URLSearchParams())).toEqual({
      range: { from: '2026-01-01', to: '2026-03-31' },
      error: null,
    })
  })

  it('reports an inverted URL range without replacing it', () => {
    const result = resolveRange(
      new URLSearchParams({ dateFrom: '2026-03-31', dateTo: '2026-03-01' }),
    )

    expect(result.range).toEqual({
      from: '2026-03-31',
      to: '2026-03-01',
    })
    expect(result.error).toBe(
      'The start date must be on or before the end date.',
    )
  })
})

describe('source and paging helpers', () => {
  it('normalises, splits and deduplicates sources', () => {
    expect(parseSourceList(' just_join_it, the_protocol_it just_join_it ')).toEqual([
      'JUST_JOIN_IT',
      'THE_PROTOCOL_IT',
    ])
    expect(parseSourceList('')).toEqual([])
    expect(parseSourceList(null)).toEqual([])
  })

  it('keeps page values zero-based and bounded by allowed sizes', () => {
    expect(parsePositiveInt('0', 20)).toBe(0)
    expect(parsePositiveInt('12', 20)).toBe(12)
    expect(parsePositiveInt('-1', 20)).toBe(20)
    expect(parsePositiveInt('1.5', 20)).toBe(20)
    expect(parsePositiveInt(null, 20)).toBe(0)
    expect(parsePositiveInt('75', 50, [25, 50, 100])).toBe(50)
    expect(parsePositiveInt('100', 50, [25, 50, 100])).toBe(100)
  })
})

describe('analytics display helpers', () => {
  it('formats shares and clamps out-of-range percentages', () => {
    expect(formatShare(12.345)).toBe('12.3%')
    expect(formatShare(0)).toBe('0%')
    expect(formatShare(null)).toBe('—')
    expect(clampPercentage(-4)).toBe(0)
    expect(clampPercentage(140)).toBe(100)
    expect(clampPercentage(Number.NaN)).toBe(0)
  })

  it('formats backend YYYY-MM months for charts and tables', () => {
    expect(formatMonth('2026-01')).toBe('Jan 26')
    expect(formatMonth('2026-12')).toBe('Dec 26')
    expect(formatMonth('unknown')).toBe('unknown')
  })
})
