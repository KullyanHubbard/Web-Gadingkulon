import type { InfografisData } from './types';

/** Empat angka ringkas di puncak dashboard. */
export interface StatRingkas {
  /** Menentukan ikon di `AdminDashboardView`. */
  id: 'penduduk' | 'kk' | 'lakiLaki' | 'perempuan';
  label: string;
  value: number;
  tone: 'brand' | 'green' | 'amber' | 'violet';
}

export function toStatRingkas(data: InfografisData): StatRingkas[] {
  return [
    {
      id: 'penduduk',
      label: 'Total Penduduk',
      value: data.totalPenduduk,
      tone: 'brand',
    },
    { id: 'kk', label: 'Kartu Keluarga', value: data.totalKK, tone: 'violet' },
    {
      id: 'lakiLaki',
      label: 'Laki-laki',
      value: data.totalLakiLaki,
      tone: 'green',
    },
    {
      id: 'perempuan',
      label: 'Perempuan',
      value: data.totalPerempuan,
      tone: 'amber',
    },
  ];
}
