/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_BASE_URL: string
  readonly VITE_APP_API_URL: string
  readonly VITE_APP_API_RESOURCE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 