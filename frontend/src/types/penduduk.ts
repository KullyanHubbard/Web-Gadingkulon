/**
 * Model domain Kependudukan, mengacu field kartu keluarga (KK) & KTP Indonesia.
 * Di `types/` karena penduduk & infografis sama-sama memakainya (CLAUDE.md §4).
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

export interface Penduduk {
  id: string;
  /** Nomor Induk Kependudukan (16 digit). */
  nik: string;
  /** Nomor Kartu Keluarga (16 digit). */
  noKK: string;
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
  alamat: Alamat;
  statusKependudukan: StatusKependudukan;
  /** ISO date string, atau null kalau barisnya masih berlaku. */
  deletedAt: string | null;
}

export interface KartuKeluarga {
  noKK: string;
  kepalaKeluarga: string;
  alamat: Alamat;
  anggota: Penduduk[];
}
