import { API_BASE_URL, API_TIMEOUT_MS } from './config'
import { ApiError } from './errors'

export type QueryValue = string | number | boolean | null | undefined
export type QueryParams = Record<string, QueryValue | QueryValue[]>

interface RequestOptions {
  query?: QueryParams
  signal?: AbortSignal
}

interface ErrorBody {
  message?: unknown
  details?: unknown
}

function buildUrl(path: string, query?: QueryParams): string {
  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
  if (!query) {
    return url
  }

  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item !== null && item !== undefined && item !== '') {
          params.append(key, String(item))
        }
      }
      continue
    }
    if (value !== null && value !== undefined && value !== '') {
      params.set(key, String(value))
    }
  }

  const queryString = params.toString()
  return queryString ? `${url}?${queryString}` : url
}

function parseDetails(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item))
  }
  if (typeof value === 'string' && value) {
    return [value]
  }
  return []
}

async function toHttpError(response: Response): Promise<ApiError> {
  let message = `Request failed with status ${response.status}`
  let details: string[] = []

  try {
    const body = (await response.json()) as ErrorBody
    if (typeof body.message === 'string' && body.message) {
      message = body.message
    }
    details = parseDetails(body.details)
  } catch {
    // The backend returned a non-JSON error body; keep the status message.
  }

  return new ApiError(response.status, message, details)
}

/**
 * The only place in the browser code that talks HTTP.
 * Non-2xx responses become ApiError; aborted requests reject with AbortError
 * and must be ignored by the caller.
 */
export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const controller = new AbortController()
  let timedOut = false

  const timer = window.setTimeout(() => {
    timedOut = true
    controller.abort()
  }, API_TIMEOUT_MS)

  const externalSignal = options.signal
  const abortFromExternal = () => controller.abort()

  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort()
    } else {
      externalSignal.addEventListener('abort', abortFromExternal, { once: true })
    }
  }

  try {
    const response = await fetch(buildUrl(path, options.query), {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    })

    if (!response.ok) {
      throw await toHttpError(response)
    }

    if (response.status === 204) {
      return undefined as T
    }

    const text = await response.text()
    if (!text) {
      return undefined as T
    }

    try {
      return JSON.parse(text) as T
    } catch {
      throw new ApiError(response.status, 'The server returned an invalid JSON response')
    }
  } catch (error) {
    if (timedOut) {
      throw new ApiError(0, 'The request took too long. Please try again.')
    }
    throw error
  } finally {
    window.clearTimeout(timer)
    externalSignal?.removeEventListener('abort', abortFromExternal)
  }
}
