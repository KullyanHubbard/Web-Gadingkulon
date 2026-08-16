import { Home, User, UserRound, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Tone } from '@/components/ui/StatCard';
import { formatAngka } from './utils';

/**
 * Empat angka ringkas kependudukan — dipakai dashboard pengurus, panel
 * statistik publik, dan rincian RW di halaman depan.
 *
 * Tinggal di `lib` karena ketiganya milik fitur/halaman berbeda dan fitur tidak
 * boleh saling impor (CLAUDE.md §4). Sebelumnya label, ikon, dan tone-nya
 * ditulis ulang di tiap tempat, dan ketiganya sempat berbeda-beda.
 */

export type StatWargaId = 'penduduk' | 'kk' | 'lakiLaki' | 'perempuan';

/** Tampilan tetap tiap angka; yang berubah cuma nilainya. */
export const STAT_WARGA: Record<
  StatWargaId,
  { label: string; icon: LucideIcon; tone: Tone }
> = {
  penduduk: { label: 'Total Penduduk', icon: Users, tone: 'brand' },
  kk: { label: 'Kartu Keluarga', icon: Home, tone: 'violet' },
  lakiLaki: { label: 'Laki-laki', icon: User, tone: 'green' },
  perempuan: { label: 'Perempuan', icon: UserRound, tone: 'amber' },
};

/** Bentuk minimal yang dibutuhkan `toStatWarga` — agregat mana pun cocok. */
export interface TotalWarga {
  totalPenduduk: number;
  totalKK: number;
  totalLakiLaki: number;
  totalPerempuan: number;
}

export interface StatWarga {
  id: StatWargaId;
  /** Sudah terformat, mis. `'1.234'`. */
  value: string;
}

export function toStatWarga(total: TotalWarga): StatWarga[] {
  return [
    { id: 'penduduk', value: formatAngka(total.totalPenduduk) },
    { id: 'kk', value: formatAngka(total.totalKK) },
    { id: 'lakiLaki', value: formatAngka(total.totalLakiLaki) },
    { id: 'perempuan', value: formatAngka(total.totalPerempuan) },
  ];
}
