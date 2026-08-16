export type Role = 'USER' | 'ADMIN';

export interface AuthUser {
  id: string;
  nama: string;
  role: Role;
  /**
   * NIK yang tertaut ke akun ini.
   * - USER (warga): identitas login sekaligus pembatas data yang boleh dilihat.
   * - ADMIN (Dukuh/RW/RT): NIK pribadi perangkat, tetap bisa lihat semua data.
   */
  nik: string;
  /** Hanya ADMIN — warga masuk memakai NIK, bukan username. */
  username?: string;
  /** Hanya ADMIN, mis. "Dukuh" atau "Ketua RT 03". */
  jabatan?: string;
  /** Kontak opsional yang diisi warga sendiri SETELAH masuk. Bukan kredensial. */
  noHp?: string;
  email?: string;
}

export interface WargaCredentials {
  nik: string;
  pin: string;
}

/** Login pengurus (Dukuh / RW / RT). */
export interface PetugasCredentials {
  username: string;
  password: string;
}

/** Aktivasi langkah 1: cocokkan NIK dengan tanggal lahir di data master. */
export interface AktivasiCek {
  nik: string;
  /** ISO date string, mis. "1985-05-17". */
  tanggalLahir: string;
}

/**
 * Hasil aktivasi langkah 1.
 *
 * `tiket` sekali pakai & berumur pendek. Tanpa tiket, klien bisa menetapkan
 * PIN untuk NIK mana pun tanpa pernah lolos verifikasi tanggal lahir.
 */
export interface AktivasiTiket {
  tiket: string;
  /** Nama pemilik NIK, untuk dikonfirmasi warga sebelum membuat PIN. */
  nama: string;
}

/** Aktivasi langkah 2: tukar tiket dengan PIN baru, langsung memperoleh sesi. */
export interface SetPinPayload {
  tiket: string;
  pin: string;
}

/** Kontak opsional milik warga — murni data yang dikumpulkan, bukan kunci masuk. */
export interface KontakPayload {
  noHp?: string;
  email?: string;
}

export interface Session {
  token: string;
  user: AuthUser;
}
