import type { Role } from '@/features/auth/types';

export type StatusPengajuan = 'MENUNGGU' | 'DISETUJUI' | 'DITOLAK' | 'GUGUR';

/** Satu jawaban penyetuju atas sebuah pengajuan. */
export interface Suara {
  pengurusId: string;
  nama: string;
  jabatan: string;
  setuju: boolean;
  /** ISO datetime. */
  pada: string;
}

/**
 * Usulan pergantian penghuni satu kursi.
 *
 * Identitas kandidat ikut disalin (`kandidatNama`, `kandidatRt`, `kandidatRw`)
 * di samping `kandidatId`: impor Excel berikutnya bisa mengubah nama atau
 * alamat orang itu, sementara riwayat harus tetap terbaca sebagaimana
 * keadaannya saat itu.
 */
export interface Pengajuan {
  id: string;
  kursi: string;
  role: Role;
  rw?: string | null;
  rt?: string | null;
  jabatan: string;
  kandidatId: string;
  kandidatNama: string;
  kandidatRt: string;
  kandidatRw: string;
  status: StatusPengajuan;
  diajukanOleh: string;
  diajukanPada: string;
  selesaiPada?: string | null;
  /** Sebab selesainya, sudah berbentuk kalimat. */
  sebab?: string | null;
  suara: Suara[];
}
