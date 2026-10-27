import { describe, expect, it } from 'vitest'
import {
  DEFAULT_PAGE_SIZE,
  DEFAULT_SORT,
  parseOffersQuery,
} from './offersQuery'

describe('parseOffersQuery', () => {
  it('uses stable pagination and sort defaults', () => {
    const state = parseOffersQuery(new URLSearchParams())

    expect(state).toEqual({
      page: 0,
      size: DEFAULT_PAGE_SIZE,
      sort: DEFAULT_SORT,
      filters: {},
      hasFilters: false,
      filtersCount: 0,
    })
  })

  it('keeps repeated filters and trims blank values', () => {
    const params = new URLSearchParams()
    params.append('categoryNames', ' JAVA ')
    params.append('categoryNames', '')
    params.append('categoryNames', 'PYTHON')
    params.append('sources', 'JUST_JOIN_IT')

    const state = parseOffersQuery(params)

    expect(state.filters).toEqual({
      categoryNames: ['JAVA', 'PYTHON'],
      sources: ['JUST_JOIN_IT'],
    })
    expect(state.hasFilters).toBe(true)
    expect(state.filtersCount).toBe(3)
  })

  it('only accepts positive integer offer ids and counts them individually', () => {
    const params = new URLSearchParams()
    for (const id of ['3', 'abc', '4', '-1', '0', '1.5']) {
      params.append('ids', id)
    }
    params.append('companyNames', 'Acme')

    const state = parseOffersQuery(params)

    expect(state.filters.ids).toEqual([3, 4])
    expect(state.filters.companyNames).toEqual(['Acme'])
    expect(state.filtersCount).toBe(3)
  })

  it('parses finite salary amounts and keeps timestamp filters untouched', () => {
    const params = new URLSearchParams({
      salaryFrom: '12000',
      salaryTo: 'not-a-number',
      publishedAtFrom: '2026-01-01T00:00',
      publishedAtTo: '2026-02-01T12:30',
    })

    const state = parseOffersQuery(params)

    expect(state.filters.salaryFrom).toBe(12000)
    expect(state.filters.salaryTo).toBeUndefined()
    expect(state.filters.publishedAtFrom).toBe('2026-01-01T00:00')
    expect(state.filters.publishedAtTo).toBe('2026-02-01T12:30')
    expect(state.filtersCount).toBe(3)
  })

  it('rejects negative pages and unsupported page sizes', () => {
    expect(parseOffersQuery(new URLSearchParams({ page: '-2' })).page).toBe(0)
    expect(parseOffersQuery(new URLSearchParams({ page: '1.5' })).page).toBe(0)
    expect(
      parseOffersQuery(new URLSearchParams({ size: '500' })).size,
    ).toBe(DEFAULT_PAGE_SIZE)
    expect(
      parseOffersQuery(new URLSearchParams({ size: '50' })).size,
    ).toBe(50)
  })

  it('accepts a custom sort and ignores unknown parameters', () => {
    const state = parseOffersQuery(
      new URLSearchParams({ sort: 'salaryMax,asc', unknown: 'value' }),
    )

    expect(state.sort).toBe('salaryMax,asc')
    expect(state.filters).toEqual({})
    expect(state.hasFilters).toBe(false)
  })
})
