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

/** Warga yang ditandai memegang jabatan ini di kolom "Jabatan" file Excel. */
export interface Calon {
  id: string;
  nama: string;
}

/**
 * Satu jabatan di padukuhan, terisi maupun kosong.
 *
 * Daftarnya diturunkan backend dari alamat warga, bukan disimpan — jadi jabatan
 * RT baru muncul sendiri begitu ada warga ber-RT itu di data.
 */
export interface Jabatan {
  /** Kunci, mis. `DUKUH`, `RW:019`, `RT:019/001`. Bukan untuk ditampilkan. */
  kode: string;
  role: Role;
  rw?: string | null;
  rt?: string | null;
  /** Label yang dibaca orang, mis. "Ketua RT 001". */
  label: string;
  pemegang: Pengurus | null;
  /**
   * Hanya terisi untuk jabatan kosong. Begitu ada pemegangnya, kolom Jabatan
   * di Excel diabaikan — kalau tidak, satu impor yang belum diperbarui bisa
   * membatalkan pergantian yang sudah disetujui.
   */
  calon: Calon | null;
}

/**
 * Mengisi satu jabatan kosong. `role`/`rw`/`rt` menunjuk jabatan mana.
 *
 * Orangnya ditunjuk lewat `wargaId`, bukan nama yang diketik: nama dari klien
 * tidak bisa diperiksa backend, sedangkan Kode Warga bisa dicocokkan ke data
 * penduduk — termasuk wilayahnya.
 */
export interface PengurusBaru {
  username: string;
  password: string;
  wargaId: string;
  role: Role;
  rw?: string;
  rt?: string;
}
