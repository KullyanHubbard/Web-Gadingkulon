/**
 * Model domain Kependudukan — dipakai lintas fitur.
 *
 * Tinggal di `types/` (bukan di `features/penduduk/`) karena fitur infografis
 * juga menghitung agregat di atas bentuk data yang sama. Lihat CLAUDE.md §4:
 * apa pun yang dibagi antar fitur dinaikkan ke `types`/`lib`/`components`.
 *
 * Mengacu pada field kartu keluarga (KK) & KTP Indonesia.
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
}

/** Satu Kartu Keluarga beserta seluruh anggotanya. */
export interface KartuKeluarga {
  noKK: string;
  kepalaKeluarga: string;
  alamat: Alamat;
  anggota: Penduduk[];
}
