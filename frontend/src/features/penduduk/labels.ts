import type {
  Agama,
  JenisKelamin,
  Pendidikan,
  StatusHubunganKeluarga,
  StatusPerkawinan,
} from '@/types/penduduk';

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

export const statusHubunganLabel: Record<StatusHubunganKeluarga, string> = {
  KEPALA_KELUARGA: 'Kepala Keluarga',
  ISTRI: 'Istri',
  ANAK: 'Anak',
  FAMILI_LAIN: 'Famili Lain',
  LAINNYA: 'Lainnya',
};
