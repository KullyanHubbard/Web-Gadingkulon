/**
 * Model domain Kependudukan, mengacu field kartu keluarga (KK) & KTP Indonesia.
 * Hanya fitur ini yang memakainya, jadi tinggal di dalam fiturnya (CLAUDE.md §4).
 * Naikkan ke `types/` kalau nanti ada fitur lain yang butuh — seperti
 * `types/statistik.ts`, yang memang dipakai lintas fitur.
 */

export type JenisKelamin = 'LAKI_LAKI' | 'PEREMPUAN';

export type Agama =
  'ISLAM' | 'KRISTEN' | 'KATOLIK' | 'HINDU' | 'BUDDHA' | 'KONGHUCU' | 'LAINNYA';

export type StatusPerkawinan =
  'BELUM_KAWIN' | 'KAWIN' | 'CERAI_HIDUP' | 'CERAI_MATI';

export type Pendidikan =
  'TIDAK_SEKOLAH' | 'SD' | 'SMP' | 'SMA' | 'D3' | 'S1' | 'S2' | 'S3';

export type StatusHubunganKeluarga =
  'KEPALA_KELUARGA' | 'ISTRI' | 'ANAK' | 'FAMILI_LAIN' | 'LAINNYA';

export type GolonganDarah = 'A' | 'B' | 'AB' | 'O' | 'TIDAK_TAHU';

/**
 * Dua sebab hilangnya warga dari daftar sengaja dipisah — lihat spec auth,
 * bagian "Hapus warga". Status ini untuk yang datanya sah tapi statusnya
 * berubah; `deletedAt` untuk baris yang memang tidak pernah valid.
 */
export type StatusKependudukan = 'AKTIF' | 'PINDAH' | 'MENINGGAL';

export interface Alamat {
  jalan: string;
  rt: string;
  rw: string;
  desa: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  kodePos: string;
}

/**
 * Satu warga. `id` UUID dibangkitkan saat impor Excel — NIK & Nomor KK tidak
 * disimpan sama sekali, jadi tidak ada kunci turunan data.
 */
export interface Penduduk {
  id: string;
  nama: string;
  jenisKelamin: JenisKelamin;
  tempatLahir: string;
  /** ISO date string, mis. "1990-05-17". */
  tanggalLahir: string;
  agama: Agama;
  statusPerkawinan: StatusPerkawinan;
  pendidikan: Pendidikan;
  pekerjaan: string;
  golonganDarah: GolonganDarah;
  statusHubunganKeluarga: StatusHubunganKeluarga;
  kewarganegaraan: string;
  /**
   * Jabatan dari kolom "Jabatan" file Excel. BUKAN penentu kewenangan — yang
   * menentukan tetap akun pengurus. Dibaca hanya untuk mencalonkan pemegang
   * jabatan yang masih kosong.
   */
  jabatan: 'WARGA' | 'DUKUH' | 'RW' | 'RT';
  alamat: Alamat;
  statusKependudukan: StatusKependudukan;
  /** ISO date string, atau null kalau barisnya masih berlaku. */
  deletedAt: string | null;
}

/**
 * Kelompok umur untuk filter & statistik. Harus sama persis dengan
 * `KELOMPOK_UMUR` di `backend/app/data/agregat.py`.
 */
export type KelompokUmur =
  '0-5' | '6-12' | '13-17' | '18-25' | '26-40' | '41-60' | '60+';

/** Filter daftar penduduk. Semua opsional, digabung AND oleh backend. */
export interface FilterPenduduk {
  jenisKelamin?: JenisKelamin;
  agama?: Agama;
  golonganDarah?: GolonganDarah;
  pendidikan?: Pendidikan;
  statusPerkawinan?: StatusPerkawinan;
  statusHubunganKeluarga?: StatusHubunganKeluarga;
  pekerjaan?: string;
  rt?: string;
  rw?: string;
  kelompokUmur?: KelompokUmur;
}

/** Pilihan filter yang bukan enum — hanya bisa diketahui dari isi data. */
export interface FilterOpsi {
  rt: string[];
  rw: string[];
  pekerjaan: string[];
}

/** Warga baru. `id` (Kode Warga) tidak ada — dibangkitkan aplikasi. */
export type PendudukBaru = Omit<
  Penduduk,
  'id' | 'statusKependudukan' | 'deletedAt' | 'jabatan'
>;

/**
 * Perubahan sebagian atas satu warga. Field yang tidak dikirim tidak disentuh.
 *
 * `alamat.rt` / `alamat.rw` hanya diterima backend kalau pengirimnya Dukuh —
 * memindahkan warga antar-wilayah bukan kewenangan Ketua RT/RW.
 */
export interface PendudukUbah {
  nama?: string;
  jenisKelamin?: JenisKelamin;
  tempatLahir?: string;
  tanggalLahir?: string;
  agama?: Agama;
  statusPerkawinan?: StatusPerkawinan;
  pendidikan?: Pendidikan;
  pekerjaan?: string;
  golonganDarah?: GolonganDarah;
  statusHubunganKeluarga?: StatusHubunganKeluarga;
  kewarganegaraan?: string;
  statusKependudukan?: StatusKependudukan;
  alamat?: Partial<Alamat>;
}
