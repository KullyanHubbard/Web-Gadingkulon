/**
 * Akses terpusat & tervalidasi untuk environment variables.
 * Jangan pernah membaca `import.meta.env.*` langsung di luar file ini.
 */

type ApiMode = 'mock' | 'http';

function readString(value: string | undefined, fallback: string): string {
  return value && value.trim().length > 0 ? value : fallback;
}

export const env = {
  apiBaseUrl: readString(import.meta.env.VITE_API_BASE_URL, '/api'),
  apiMode: readString(import.meta.env.VITE_API_MODE, 'mock') as ApiMode,
  appName: readString(import.meta.env.VITE_APP_NAME, 'SIDUK'),
} as const;

export const isMockMode = env.apiMode === 'mock';
