import type {
  Agama,
  GolonganDarah,
  StatusKependudukan,
  JenisKelamin,
  KelompokUmur,
  Pendidikan,
  StatusHubunganKeluarga,
  StatusPerkawinan,
} from './types';
import type { Distribusi } from '@/types/statistik';

/** Peta enum -> label yang enak dibaca untuk ditampilkan di UI. */

export const jenisKelaminLabel: Record<JenisKelamin, string> = {
  LAKI_LAKI: 'Laki-laki',
  PEREMPUAN: 'Perempuan',
};

export const agamaLabel: Record<Agama, string> = {
  ISLAM: 'Islam',
  KRISTEN: 'Kristen',
  KATOLIK: 'Katolik',
  HINDU: 'Hindu',
  BUDDHA: 'Buddha',
  KONGHUCU: 'Konghucu',
  LAINNYA: 'Lainnya',
};

export const statusPerkawinanLabel: Record<StatusPerkawinan, string> = {
  BELUM_KAWIN: 'Belum Kawin',
  KAWIN: 'Kawin',
  CERAI_HIDUP: 'Cerai Hidup',
  CERAI_MATI: 'Cerai Mati',
};

export const pendidikanLabel: Record<Pendidikan, string> = {
  TIDAK_SEKOLAH: 'Tidak Sekolah',
  SD: 'SD',
  SMP: 'SMP',
  SMA: 'SMA/SMK',
  D3: 'Diploma (D3)',
  S1: 'Sarjana (S1)',
  S2: 'Magister (S2)',
  S3: 'Doktor (S3)',
};

export const golonganDarahLabel: Record<GolonganDarah, string> = {
  A: 'A',
  B: 'B',
  AB: 'AB',
  O: 'O',
  TIDAK_TAHU: 'Tidak Tahu',
};

/** Nomor KK tidak didata lagi, tapi peran tiap orang di keluarganya tetap. */
export const statusHubunganLabel: Record<StatusHubunganKeluarga, string> = {
  KEPALA_KELUARGA: 'Kepala Keluarga',
  ISTRI: 'Istri',
  ANAK: 'Anak',
  FAMILI_LAIN: 'Famili Lain',
  LAINNYA: 'Lainnya',
};

export const statusKependudukanLabel: Record<StatusKependudukan, string> = {
  AKTIF: 'Aktif',
  PINDAH: 'Pindah',
  MENINGGAL: 'Meninggal',
};

/** Urutan tampil kelompok umur — sama dengan `KELOMPOK_UMUR` di backend. */
export const kelompokUmurOpsi: readonly KelompokUmur[] = [
  '0-5',
  '6-12',
  '13-17',
  '18-25',
  '26-40',
  '41-60',
  '60+',
];

/**
 * Terjemahkan label enum mentah pada distribusi menjadi label manusiawi.
 *
 * Backend mengirim `'ISLAM'`, chart menampilkan `'Islam'`. Tinggal di sini
 * bersama petanya karena dua halaman memakainya — infografis admin dan rincian
 * RW di halaman depan.
 */
export function relabel<T extends string>(
  data: Distribusi[],
  map: Record<T, string>,
): Distribusi[] {
  return data.map((d) => ({ ...d, label: map[d.label as T] ?? d.label }));
}
