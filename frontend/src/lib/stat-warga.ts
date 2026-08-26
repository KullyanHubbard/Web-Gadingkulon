import ikonLakiLaki from '@/assets/icons/laki-laki.png';
import ikonPenduduk from '@/assets/icons/penduduk.png';
import ikonPerempuan from '@/assets/icons/perempuan.png';
import { formatAngka } from './utils';

/**
 * Tiga angka ringkas kependudukan, dipakai dashboard pengurus + statistik
 * publik + rincian RW. Di `lib` karena ketiganya fitur berbeda dan fitur tidak
 * boleh saling impor (CLAUDE.md §4).
 *
 * Kartu "Kartu Keluarga" dulu ikut di sini; hilang bersama nomor KK yang tidak
 * lagi didata, jadi tidak ada kunci pengelompokan keluarga untuk dihitung.
 */
export type StatWargaId = 'penduduk' | 'lakiLaki' | 'perempuan';

export const STAT_WARGA: Record<StatWargaId, { label: string; icon: string }> =
  {
    penduduk: { label: 'Total Penduduk', icon: ikonPenduduk },
    lakiLaki: { label: 'Laki-laki', icon: ikonLakiLaki },
    perempuan: { label: 'Perempuan', icon: ikonPerempuan },
  };

/** Bentuk minimal yang dibutuhkan `toStatWarga` — agregat mana pun cocok. */
export interface TotalWarga {
  totalPenduduk: number;
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
    { id: 'lakiLaki', value: formatAngka(total.totalLakiLaki) },
    { id: 'perempuan', value: formatAngka(total.totalPerempuan) },
  ];
}
