/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_DB_SCHEMA: string
  readonly VITE_OPENAI_API_KEY: string
  readonly VITE_OPENAI_BASE_URL: string
  readonly VITE_SIGN_SECRET: string
  readonly VITE_FALCON: string
  // More environment variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

