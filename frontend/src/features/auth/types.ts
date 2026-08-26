/**
 * Empat peran, dan yang membedakannya bukan tingkat melainkan ARAH kewenangan:
 * ADMIN mengelola akun dan tidak boleh membaca data warga; tiga sisanya membaca
 * data warga dan tidak bisa menyentuh akun siapa pun.
 */
export type Role = 'ADMIN' | 'DUKUH' | 'RW' | 'RT';

/** Peran yang boleh membaca data warga. */
export const ROLE_PENGURUS: readonly Role[] = ['DUKUH', 'RW', 'RT'];

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
  /** Turunan dari role + rw + rt, dihitung backend. Mis. "Ketua RT 001". */
  jabatan: string;
  /**
   * Password awal dari Admin masih berlaku. Selama ini true, backend menolak
   * akun ini di semua endpoint selain ganti password.
   */
  harusGantiPassword: boolean;
}

/** Login pengurus (Dukuh / RW / RT) — satu-satunya jalur masuk. */
export interface PetugasCredentials {
  username: string;
  password: string;
}

export interface GantiPassword {
  passwordLama: string;
  passwordBaru: string;
}

export interface Session {
  token: string;
  user: AuthUser;
}
