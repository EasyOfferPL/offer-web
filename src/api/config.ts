/**
 * Single place where the browser learns where the backend lives.
 *
 * Production must use same-origin routing (reverse proxy /api -> backend)
 * because the inspected backend has no explicit CORS configuration.
 * No backend secret may ever be referenced from this module.
 */
const rawBaseUrl = import.meta.env.VITE_API_BASE_URL ?? '/api'

export const API_BASE_URL = rawBaseUrl.replace(/\/+$/, '') || '/api'

export const API_TIMEOUT_MS = 15_000
