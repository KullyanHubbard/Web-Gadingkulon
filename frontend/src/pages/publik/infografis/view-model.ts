import {
  agamaLabel,
  pendidikanLabel,
  relabel,
  statusPerkawinanLabel,
} from '@/features/penduduk/labels';
import type {
  RincianRw,
  StatistikPublik,
} from '@/features/statistik-publik/types';
import type { Distribusi, PanelDistribusi } from '@/types/statistik';

/**
 * Susunan panel infografis publik.
 *
 * Di level halaman, bukan di dalam fitur, karena di sinilah dua fitur bertemu:
 * angka agregat dari `statistik-publik`, peta label domain dari `penduduk`.
 * Fitur tidak boleh saling mengimpor (CLAUDE.md §4) — halaman boleh merakit.
 * Alasannya sama persis dengan `pages/admin/infografis/view-model.ts`.
 */

/**
 * Jumlahkan distribusi dari semua RW jadi satu distribusi se-padukuhan.
 *
 * Dihitung di klien, bukan ditambahkan sebagai field baru di
 * `/publik/statistik`: angkanya sudah ada seluruhnya di `perRw`, dan setiap
 * field baru pada endpoint terbuka adalah keputusan publikasi tersendiri.
 */
export function gabungDistribusi(
  perRw: RincianRw[],
  ambil: (rw: RincianRw) => Distribusi[],
): Distribusi[] {
  const total = new Map<string, number>();
  for (const rw of perRw) {
    for (const d of ambil(rw)) {
      total.set(d.label, (total.get(d.label) ?? 0) + d.value);
    }
  }
  return [...total].map(([label, value]) => ({ label, value }));
}

/**
 * Piramida usia — kelompok umur DIURUTKAN menurut usia, bukan menurut cacah.
 *
 * `distribusi_by` di backend mengurutkan terbanyak-dulu, dan itu benar untuk
 * kategori tanpa urutan alami. Umur punya urutan alami: "26-40" di antara
 * "18-25" dan "41-60" adalah setengah dari informasinya.
 */
function urutKelompokUmur(data: Distribusi[]): Distribusi[] {
  return [...data].sort(
    (a, b) => Number.parseInt(a.label, 10) - Number.parseInt(b.label, 10),
  );
}

export function toPanelDemografi(data: StatistikPublik): PanelDistribusi[] {
  return [
    {
      id: 'umur',
      judul: 'Piramida Usia',
      deskripsi: 'Sebaran penduduk menurut kelompok umur',
      jenis: 'bar',
      data: urutKelompokUmur(
        gabungDistribusi(data.perRw, (rw) => rw.perKelompokUmur),
      ),
    },
    {
      id: 'agama',
      judul: 'Distribusi Agama',
      deskripsi: 'Islam, Kristen, Katolik, Hindu, Buddha, Konghucu',
      jenis: 'pie',
      data: relabel(
        gabungDistribusi(data.perRw, (rw) => rw.perAgama),
        agamaLabel,
      ),
    },
    {
      id: 'pekerjaan',
      judul: 'Pekerjaan',
      deskripsi: 'Sepuluh pekerjaan terbanyak di padukuhan',
      jenis: 'bar',
      data: data.perPekerjaan,
    },
    {
      id: 'perkawinan',
      judul: 'Status Perkawinan',
      deskripsi: 'Komposisi status perkawinan penduduk',
      jenis: 'pie',
      data: relabel(
        gabungDistribusi(data.perRw, (rw) => rw.perStatusPerkawinan),
        statusPerkawinanLabel,
      ),
    },
    {
      id: 'pendidikan',
      judul: 'Tingkat Pendidikan',
      deskripsi: 'Pendidikan terakhir penduduk',
      jenis: 'bar',
      data: relabel(
        gabungDistribusi(data.perRw, (rw) => rw.perPendidikan),
        pendidikanLabel,
      ),
      lebarPenuh: true,
    },
  ];
}
