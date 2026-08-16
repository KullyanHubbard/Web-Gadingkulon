import { toStatWarga } from '@/lib/stat-warga';
import type { StatWarga } from '@/lib/stat-warga';
import { formatAngka } from '@/lib/utils';
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

/** Satu ruas jalur breadcrumb. */
export interface Crumb {
  label: string;
  /**
   * Tujuan bila ruas ini diklik, atau `null` untuk ruas terakhir — itu halaman
   * yang sedang dibuka, jadi bukan tautan.
   *
   * Sengaja berupa data, bukan callback: penyusunan jalurnya tetap fungsi
   * murni, dan komponennya tinggal memetakan tujuan ke `onPilih`.
   */
  tujuan: TujuanWilayah | null;
}

/**
 * Susun jalur breadcrumb dari wilayah yang sedang aktif.
 *
 * Susunannya mengikuti rail kiri: "Dashboard" berdiri sendiri di luar bagian
 * "Statistik Warga", sedangkan RW & RT ada di dalamnya.
 */
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
    // Donut cuma butuh cacah per RW; sisanya (gender, umur, dst.) dipakai
    // panel rincian, jadi diturunkan di sini alih-alih dikirim dua kali.
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
