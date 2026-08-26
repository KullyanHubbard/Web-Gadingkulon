import type { Session } from './types';

/**
 * Persistensi sesi di localStorage.
 * Dipisah dari store agar bisa dipakai interceptor api-client tanpa
 * membuat dependensi lingkaran ke store Zustand.
 *
 * Catatan keamanan: menyimpan token di localStorage rawan XSS. Untuk produksi,
 * pertimbangkan httpOnly cookie yang di-set oleh FastAPI.
 */

const STORAGE_KEY = 'nia.session';

export function getStoredSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function getStoredToken(): string | null {
  return getStoredSession()?.token ?? null;
}

export function storeSession(session: Session): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  localStorage.removeItem(STORAGE_KEY);
}
