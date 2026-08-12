/** Agregat statistik kependudukan untuk halaman infografis (admin). */

export interface Distribusi {
  label: string;
  value: number;
}

export interface InfografisData {
  totalPenduduk: number;
  totalKK: number;
  totalLakiLaki: number;
  totalPerempuan: number;
  perAgama: Distribusi[];
  perKelompokUmur: Distribusi[];
  perPendidikan: Distribusi[];
  perStatusPerkawinan: Distribusi[];
  perDusun: Distribusi[];
}
