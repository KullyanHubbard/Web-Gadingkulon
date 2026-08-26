export type Role = 'ADMIN' | 'PENGURUS';

/**
 * Akun perangkat desa. Warga tidak punya akun sama sekali — lihat
 * `docs/superpowers/specs/2026-08-26-hapus-nik-kk-auth-pengurus-design.md`.
 */
export interface AuthUser {
  id: string;
  nama: string;
  username: string;
  role: Role;
  /** Wilayah kerja. Kosong untuk Dukuh; `rt` kosong untuk Ketua RW. */
  rw?: string | null;
  rt?: string | null;
  /** Turunan dari role + rw + rt, dihitung backend. Mis. "Ketua RT 03". */
  jabatan: string;
}

/** Login pengurus (Dukuh / RW / RT) — satu-satunya jalur masuk. */
export interface PetugasCredentials {
  username: string;
  password: string;
}

export interface Session {
  token: string;
  user: AuthUser;
}
