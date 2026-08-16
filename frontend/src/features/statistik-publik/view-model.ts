import { toStatWarga } from '@/lib/stat-warga';
import type { StatWarga } from '@/lib/stat-warga';
import { formatAngka } from '@/lib/utils';
import type { Distribusi } from '@/types/statistik';
import type { StatistikPublik } from './types';

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
  /**
   * Tiga kartu, bukan empat: total penduduk sudah jadi angka besar di lubang
   * donut, dan mengulangnya sebagai kartu berarti angka yang sama dua kali
   * dalam satu pandangan mata.
   */
  stat: StatWarga[];
  /** Data mentah untuk chart; urutannya sama dengan `baris`. */
  distribusi: Distribusi[];
  baris: BarisRw[];
}

/** Wilayah yang dituju sebuah crumb; `null` di kedua sisi berarti dashboard. */
export interface TujuanWilayah {
  rw: string | null;
  rt: string | null;
}

export interface Crumb {
  label: string;
  /** `null` = ruas terakhir: halaman yang sedang dibuka, jadi bukan tautan. */
  tujuan: TujuanWilayah | null;
}

/** Jalur breadcrumb mengikuti rail kiri: "Dashboard" di luar "Statistik Warga". */
export function toJalurWilayah(
  rwAktif: string | null,
  rtAktif: string | null,
): Crumb[] {
  if (rwAktif === null) return [{ label: 'Dashboard', tujuan: null }];

  const jalur: Crumb[] = [
    { label: 'Statistik Warga', tujuan: { rw: null, rt: null } },
    {
      label: rwAktif,
      tujuan: rtAktif === null ? null : { rw: rwAktif, rt: null },
    },
  ];
  if (rtAktif !== null) jalur.push({ label: rtAktif, tujuan: null });
  return jalur;
}

export function toRingkasanStatistik(
  data: StatistikPublik,
): RingkasanStatistik {
  const total = data.totalPenduduk;

  return {
    distribusi: data.perRw.map((d) => ({
      label: d.label,
      value: d.totalPenduduk,
    })),
    totalTeks: formatAngka(total),
    stat: toStatWarga(data).filter((s) => s.id !== 'penduduk'),
    baris: data.perRw.map((d) => ({
      label: d.label,
      jumlahTeks: `${formatAngka(d.totalPenduduk)} jiwa`,
      persenTeks:
        total === 0 ? '—' : `${Math.round((d.totalPenduduk / total) * 100)}%`,
    })),
  };
}
