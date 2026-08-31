import ikonKeluarga from '@/assets/icons/keluarga.png';
import ikonLakiLaki from '@/assets/icons/laki-laki.png';
import ikonPenduduk from '@/assets/icons/penduduk.png';
import ikonPerempuan from '@/assets/icons/perempuan.png';
import { formatAngka } from './utils';

/**
 * Empat angka ringkas kependudukan, dipakai dashboard pengurus + statistik
 * publik + rincian RW. Di `lib` karena ketiganya fitur berbeda dan fitur tidak
 * boleh saling impor (CLAUDE.md §4).
 */
export type StatWargaId = 'keluarga' | 'penduduk' | 'lakiLaki' | 'perempuan';

export const STAT_WARGA: Record<StatWargaId, { label: string; icon: string }> =
  {
    keluarga: { label: 'Jumlah Kartu Keluarga', icon: ikonKeluarga },
    penduduk: { label: 'Total Penduduk', icon: ikonPenduduk },
    lakiLaki: { label: 'Laki-laki', icon: ikonLakiLaki },
    perempuan: { label: 'Perempuan', icon: ikonPerempuan },
  };

/** Bentuk minimal yang dibutuhkan `toStatWarga` — agregat mana pun cocok. */
export interface TotalWarga {
  /** Opsional: infografis pengurus tidak menghitung KK, statistik publik ya. */
  totalKepalaKeluarga?: number;
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
  const hasil: StatWarga[] = [];
  if (total.totalKepalaKeluarga != null) {
    hasil.push({ id: 'keluarga', value: formatAngka(total.totalKepalaKeluarga) });
  }
  hasil.push(
    { id: 'penduduk', value: formatAngka(total.totalPenduduk) },
    { id: 'lakiLaki', value: formatAngka(total.totalLakiLaki) },
    { id: 'perempuan', value: formatAngka(total.totalPerempuan) },
  );
  return hasil;
}
