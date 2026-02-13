/// <reference types="vite/client" />

/**
 * Vite Environment Variables
 *
 * Provides TypeScript type safety for import.meta.env values.
 * Add this to your /src directory (or reference it in tsconfig.json).
 */

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
