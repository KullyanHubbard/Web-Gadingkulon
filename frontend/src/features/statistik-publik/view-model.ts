import type { Distribusi } from '@/types/statistik';
import type { StatistikPublik } from './types';

/**
 * Ubah agregat mentah menjadi bentuk siap tampil.
 *
 * Seluruh perhitungan & pemformatan angka berhenti di sini, sehingga komponen
 * `*View` tinggal mencetak string dan tidak pernah menghitung apa pun.
 */

/** Satu baris legenda di samping donut. */
export interface BarisRw {
  label: string;
  /** Mis. `'14 jiwa'`. */
  jumlahTeks: string;
  /** Mis. `'39%'`. */
  persenTeks: string;
}

export interface RingkasanStatistik {
  /** Mis. `'36'` — angka besar di tengah donut. */
  totalTeks: string;
  /** Data mentah untuk chart; urutannya sama dengan `baris`. */
  distribusi: Distribusi[];
  baris: BarisRw[];
}

const angka = new Intl.NumberFormat('id-ID');

export function toRingkasanStatistik(
  data: StatistikPublik,
): RingkasanStatistik {
  const total = data.totalPenduduk;

  return {
    totalTeks: angka.format(total),
    distribusi: data.perRw,
    baris: data.perRw.map((d) => ({
      label: d.label,
      jumlahTeks: `${angka.format(d.value)} jiwa`,
      persenTeks: total === 0 ? '—' : `${Math.round((d.value / total) * 100)}%`,
    })),
  };
}
