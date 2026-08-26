/** Agregat statistik kependudukan untuk halaman infografis (admin). */

import type { Distribusi } from '@/types/statistik';

export interface InfografisData {
  totalPenduduk: number;
  totalLakiLaki: number;
  totalPerempuan: number;
  perAgama: Distribusi[];
  perKelompokUmur: Distribusi[];
  perPendidikan: Distribusi[];
  perStatusPerkawinan: Distribusi[];
  perDusun: Distribusi[];
}
