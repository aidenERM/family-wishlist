/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_FAMILY_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
