import type { AuthUser, Role } from '@/features/auth/types';

/**
 * Akun pengurus di halaman kelola akun: `AuthUser` + status aktif.
 *
 * `aktif` tidak ikut `AuthUser` biasa — di dalam sesi nilainya selalu true
 * (yang nonaktif tidak bisa masuk), jadi mengirimkannya di sana cuma
 * menyiratkan pilihan yang tidak ada.
 */
export interface Pengurus extends AuthUser {
  aktif: boolean;
}

export interface PengurusBaru {
  username: string;
  password: string;
  nama: string;
  role: Role;
  rw?: string;
  rt?: string;
}

/** Field yang tidak dikirim tidak diubah backend. */
export interface PengurusUbah {
  nama?: string;
  rw?: string | null;
  rt?: string | null;
  aktif?: boolean;
}
