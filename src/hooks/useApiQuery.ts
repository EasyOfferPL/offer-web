import { useCallback, useEffect, useState } from 'react'
import { isAbortError } from '../api/errors'

export type AsyncStatus = 'loading' | 'success' | 'error'

export interface ApiQueryState<T> {
  status: AsyncStatus
  data: T | null
  error: unknown
  reload: () => void
}

interface QueryResult<T> {
  key: string
  status: AsyncStatus
  data: T | null
  error: unknown
}

/**
 * Minimal data-fetching primitive for M1.
 *
 * - every run gets its own AbortController, cancelled on unmount or dep change;
 * - responses that arrive after cancellation are ignored;
 * - aborted requests never become an error state;
 * - "loading" is derived from the request key instead of being written to state
 *   synchronously inside the effect.
 *
 * `deps` must contain plain serialisable values (filters, page number, id).
 * The inline `request` callback is intentionally not a dependency: it is read
 * only for the run that matches `deps`.
 */
export function useApiQuery<T>(
  request: (signal: AbortSignal) => Promise<T>,
  deps: readonly unknown[],
): ApiQueryState<T> {
  const [reloadToken, setReloadToken] = useState(0)
  const requestKey = `${reloadToken}:${JSON.stringify(deps)}`
  const [result, setResult] = useState<QueryResult<T>>({
    key: '',
    status: 'loading',
    data: null,
    error: null,
  })

  const current: QueryResult<T> =
    result.key === requestKey
      ? result
      : { key: requestKey, status: 'loading', data: null, error: null }

  const reload = useCallback(() => {
    setReloadToken((value) => value + 1)
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    Promise.resolve()
      .then(() => request(controller.signal))
      .then((data) => {
        if (!controller.signal.aborted) {
          setResult({ key: requestKey, status: 'success', data, error: null })
        }
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted || isAbortError(error)) {
          return
        }
        setResult({ key: requestKey, status: 'error', data: null, error })
      })

    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadToken, requestKey])

  return {
    status: current.status,
    data: current.data,
    error: current.error,
    reload,
  }
}
