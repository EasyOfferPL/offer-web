import { useState } from 'react'
import { offersApi } from '../api/endpoints'
import { ApiError } from '../api/errors'
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from '../components/AsyncStates'
import { PageHeader } from '../components/PageHeader'
import { useApiQuery } from '../hooks/useApiQuery'

function LiveOffersProbe() {
  const { status, data, error, reload } = useApiQuery(
    (signal) => offersApi.list({ page: 0, size: 3 }, signal),
    [],
  )

  if (status === 'loading') {
    return <LoadingState label="Calling GET /offers…" />
  }

  if (status === 'error') {
    return <ErrorState error={error} onRetry={reload} />
  }

  if (!data || data.content.length === 0) {
    return (
      <EmptyState
        title="No offers returned"
        description="GET /offers succeeded, but the first page is empty."
      />
    )
  }

  return (
    <ul className="checklist">
      {data.content.map((offer) => (
        <li key={offer.id}>{offer.title}</li>
      ))}
    </ul>
  )
}

/**
 * Development-only demonstration of the shared request states (FE-007).
 * Not part of the shipped route table; removed by the DEV guard in router.tsx.
 */
export function UiStatesPage() {
  const [showLive, setShowLive] = useState(false)

  return (
    <div className="page">
      <PageHeader
        title="UI request states"
        description="Loading, empty and error states shared by every screen."
        badge="Dev only"
      />

      <section className="card">
        <h2>Loading</h2>
        <LoadingState />
      </section>

      <section className="card">
        <h2>Empty</h2>
        <EmptyState
          title="No offers match these filters"
          description="Try clearing a filter or widening the date range."
        />
      </section>

      <section className="card">
        <h2>Error</h2>
        <ErrorState
          error={new ApiError(500, 'Internal server error', ['trace id: demo-only'])}
        />
      </section>

      <section className="card">
        <h2>Live request</h2>
        <p className="muted">
          Calls the configured API through the shared client. With the backend
          stopped this should show the error state, not a blank screen.
        </p>
        <button
          type="button"
          className="btn"
          onClick={() => setShowLive((value) => !value)}
        >
          {showLive ? 'Unmount probe' : 'Mount probe'}
        </button>
        {showLive ? <LiveOffersProbe /> : null}
      </section>
    </div>
  )
}
