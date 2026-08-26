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

/**
 * Satu jabatan di padukuhan, terisi maupun kosong.
 *
 * Daftarnya diturunkan backend dari alamat warga, bukan disimpan — jadi kursi
 * RT baru muncul sendiri begitu ada warga ber-RT itu di data.
 */
/** Warga yang ditandai memegang kursi ini di kolom "Jabatan" file Excel. */
export interface Calon {
  id: string;
  nama: string;
}

export interface Kursi {
  /** Penanda kursi, mis. `DUKUH`, `RW:019`, `RT:019/001`. */
  kursi: string;
  role: Role;
  rw?: string | null;
  rt?: string | null;
  /** Mis. "Ketua RT 001". */
  jabatan: string;
  penghuni: Pengurus | null;
  /**
   * Hanya terisi untuk kursi kosong. Begitu kursinya punya penghuni, kolom
   * Jabatan di Excel diabaikan — kalau tidak, satu impor yang belum diperbarui
   * bisa membatalkan pergantian yang sudah disetujui.
   */
  calon: Calon | null;
}

/** Mengisi satu kursi kosong. `role`/`rw`/`rt` menunjuk kursi mana. */
export interface PengurusBaru {
  username: string;
  password: string;
  nama: string;
  role: Role;
  rw?: string;
  rt?: string;
}
