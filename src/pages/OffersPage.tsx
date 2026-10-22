import type { FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { categoriesApi, offersApi } from '../api/endpoints'
import { EmptyState, ErrorState, LoadingState } from '../components/AsyncStates'
import { OfferCard } from '../components/OfferCard'
import { PageHeader } from '../components/PageHeader'
import { Pagination } from '../components/Pagination'
import { useApiQuery } from '../hooks/useApiQuery'
import { FILTER_KEYS, PAGE_SIZES, parseOffersQuery } from '../lib/offersQuery'

function toDateTimeLocal(value: string | null): string {
  return value ? value.slice(0, 16) : ''
}

const ADVANCED_KEYS = [
  'experienceLevels',
  'employmentTypes',
  'workModes',
  'currencies',
  'salaryFrom',
  'salaryTo',
  'publishedAtFrom',
  'publishedAtTo',
] as const

export function OffersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryKey = searchParams.toString()
  const state = parseOffersQuery(searchParams)
  const categoriesSelected = searchParams.getAll('categoryNames')
  const hasAdvancedFilters = ADVANCED_KEYS.some((key) => searchParams.has(key))

  const categories = useApiQuery((signal) => categoriesApi.list(signal), [])

  const offers = useApiQuery(
    (signal) =>
      state.hasFilters
        ? offersApi.search(
            state.filters,
            { page: state.page, size: state.size, sort: state.sort },
            signal,
          )
        : offersApi.list(
            { page: state.page, size: state.size, sort: state.sort },
            signal,
          ),
    [queryKey],
  )

  function updateParams(mutate: (next: URLSearchParams) => void) {
    const next = new URLSearchParams(searchParams)
    mutate(next)
    setSearchParams(next)
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const next = new URLSearchParams()

    for (const key of FILTER_KEYS) {
      for (const raw of data.getAll(key)) {
        const value = String(raw).trim()
        if (value) {
          next.append(key, value)
        }
      }
    }

    next.set('sort', state.sort)
    next.set('size', String(state.size))
    next.set('page', '0')
    setSearchParams(next)
  }

  function handleReset() {
    setSearchParams({ sort: state.sort, size: String(state.size), page: '0' })
  }

  function goToPage(page: number) {
    updateParams((next) => next.set('page', String(page)))
  }

  function changeSize(size: number) {
    updateParams((next) => {
      next.set('size', String(size))
      next.set('page', '0')
    })
  }

  function changeSort(sort: string) {
    updateParams((next) => {
      next.set('sort', sort)
      next.set('page', '0')
    })
  }

  return (
    <div className="page">
      <PageHeader
        title="Offers"
        description="Browse and filter persisted offers. Filters are combined with AND and kept in the URL."
        badge="Dataset"
      />

      <section className="stat-rail" aria-label="Dataset summary">
        <div className="stat">
          <span className="stat__label">Offers</span>
          <span className="stat__value stat__value--accent">
            {offers.data ? offers.data.totalElements : '—'}
          </span>
        </div>
        <div className="stat">
          <span className="stat__label">Pages</span>
          <span className="stat__value">
            {offers.data ? Math.max(offers.data.totalPages, 1) : '—'}
          </span>
        </div>
        <div className="stat">
          <span className="stat__label">Current page</span>
          <span className="stat__value">
            {offers.data ? offers.data.page + 1 : '—'}
          </span>
        </div>
        <div className="stat">
          <span className="stat__label">Categories</span>
          <span className="stat__value">{categories.data ? categories.data.length : '—'}</span>
        </div>
      </section>

      <form key={queryKey} className="card filters" onSubmit={handleSubmit}>
        <div className="filters__header">
          <div>
            <h2>Filters</h2>
            <p className="muted">Results must match every active value.</p>
          </div>
          <div className="filters__header-meta">
            <span className="badge badge--muted">
              {state.hasFilters ? `${state.filtersCount} active` : 'No filters'}
            </span>
            <button className="btn btn--ghost btn--sm" type="button" onClick={handleReset}>
              Reset
            </button>
          </div>
        </div>

        <div className="filters__group">
          <span className="filters__legend">Keywords</span>
          <div className="filters__grid filters__grid--keywords">
            <label className="field">
              <span>Title contains</span>
              <input
                name="titles"
                type="search"
                placeholder="e.g. Java"
                defaultValue={searchParams.get('titles') ?? ''}
              />
            </label>

            <label className="field">
              <span>Company</span>
              <input
                name="companyNames"
                type="search"
                placeholder="e.g. Acme"
                defaultValue={searchParams.get('companyNames') ?? ''}
              />
            </label>

            <label className="field">
              <span>Technology</span>
              <input
                name="technologies"
                type="text"
                placeholder="e.g. Java"
                defaultValue={searchParams.get('technologies') ?? ''}
              />
            </label>

            <label className="field">
              <span>Source</span>
              <input
                name="sources"
                type="text"
                placeholder="e.g. JUST_JOIN_IT"
                defaultValue={searchParams.get('sources') ?? ''}
              />
            </label>
          </div>
        </div>

        <div className="filters__group">
          <span className="filters__legend">Category</span>
          {categories.status === 'loading' ? (
            <p className="field__hint field__hint--muted">Loading categories…</p>
          ) : null}
          {categories.status === 'error' ? (
            <p className="field__hint">Categories are unavailable right now.</p>
          ) : null}
          {categories.status === 'success' && categories.data?.length === 0 ? (
            <p className="field__hint field__hint--muted">No categories in the dataset yet.</p>
          ) : null}
          {categories.data && categories.data.length > 0 ? (
            <div className="check-chips">
              {categories.data.map((category) => (
                <label key={category.categoryName} className="check-chip">
                  <input
                    type="checkbox"
                    name="categoryNames"
                    value={category.categoryName}
                    defaultChecked={categoriesSelected.includes(category.categoryName)}
                  />
                  <span>{category.categoryName}</span>
                </label>
              ))}
            </div>
          ) : null}
        </div>

        <details className="filters__more" open={hasAdvancedFilters}>
          <summary>
            <span>Salary, seniority and dates</span>
            <span className="filters__more-hint">
              {hasAdvancedFilters ? 'Active' : 'Optional'}
            </span>
          </summary>

          <div className="filters__more-body">
            <div className="filters__grid">
              <label className="field">
                <span>Experience level</span>
                <input
                  name="experienceLevels"
                  type="text"
                  placeholder="e.g. SENIOR"
                  defaultValue={searchParams.get('experienceLevels') ?? ''}
                />
              </label>

              <label className="field">
                <span>Employment type</span>
                <input
                  name="employmentTypes"
                  type="text"
                  placeholder="e.g. B2B"
                  defaultValue={searchParams.get('employmentTypes') ?? ''}
                />
              </label>

              <label className="field">
                <span>Work mode</span>
                <input
                  name="workModes"
                  type="text"
                  placeholder="e.g. REMOTE"
                  defaultValue={searchParams.get('workModes') ?? ''}
                />
              </label>

              <label className="field">
                <span>Currency</span>
                <input
                  name="currencies"
                  type="text"
                  placeholder="e.g. PLN"
                  defaultValue={searchParams.get('currencies') ?? ''}
                />
              </label>

              <label className="field">
                <span>Salary from</span>
                <input
                  name="salaryFrom"
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  defaultValue={searchParams.get('salaryFrom') ?? ''}
                />
              </label>

              <label className="field">
                <span>Salary to</span>
                <input
                  name="salaryTo"
                  type="number"
                  min={0}
                  step={1}
                  inputMode="numeric"
                  defaultValue={searchParams.get('salaryTo') ?? ''}
                />
              </label>

              <label className="field">
                <span>Published from</span>
                <input
                  name="publishedAtFrom"
                  type="datetime-local"
                  defaultValue={toDateTimeLocal(searchParams.get('publishedAtFrom'))}
                />
              </label>

              <label className="field">
                <span>Published to</span>
                <input
                  name="publishedAtTo"
                  type="datetime-local"
                  defaultValue={toDateTimeLocal(searchParams.get('publishedAtTo'))}
                />
              </label>
            </div>
          </div>
        </details>

        <div className="filters__actions">
          <button className="btn" type="submit">
            Apply filters
          </button>
          <span className="muted filters__hint">
            Filters are stored in the URL, so the current view can be shared.
          </span>
        </div>
      </form>

      {offers.status === 'loading' ? <LoadingState label="Loading offers…" /> : null}

      {offers.status === 'error' ? (
        <ErrorState error={offers.error} onRetry={offers.reload} />
      ) : null}

      {offers.status === 'success' && offers.data ? (
        offers.data.content.length === 0 ? (
          <EmptyState
            title="No offers match these filters"
            description="Try removing a filter, widening the salary range or changing the publication dates."
            action={
              state.hasFilters ? (
                <button type="button" className="btn" onClick={handleReset}>
                  Clear filters
                </button>
              ) : undefined
            }
          />
        ) : (
          <>
            <div className="toolbar">
              <p className="toolbar__summary">
                <strong>{offers.data.totalElements}</strong>{' '}
                <span className="muted">
                  offer(s) · page {offers.data.page + 1} of{' '}
                  {Math.max(offers.data.totalPages, 1)}
                </span>
              </p>

              <div className="toolbar__controls">
                <label className="field field--inline">
                  <span>Page size</span>
                  <select
                    value={state.size}
                    onChange={(event) => changeSize(Number(event.target.value))}
                  >
                    {PAGE_SIZES.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field field--inline">
                  <span>Sort by</span>
                  <select
                    value={state.sort}
                    onChange={(event) => changeSort(event.target.value)}
                  >
                    <option value="publishedAt,desc">Newest first</option>
                    <option value="publishedAt,asc">Oldest first</option>
                    <option value="salaryMax,desc">Highest salary</option>
                    <option value="salaryMax,asc">Lowest salary</option>
                    <option value="id,asc">ID ascending</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="offer-list">
              {offers.data.content.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>

            <Pagination
              page={offers.data.page}
              totalPages={offers.data.totalPages}
              first={offers.data.first}
              last={offers.data.last}
              onChange={goToPage}
            />
          </>
        )
      ) : null}
    </div>
  )
}
