interface ImportMetaEnv {
  /** Browser-visible API base URL. Defaults to /api. */
  readonly VITE_API_BASE_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
