import { Fragment } from 'react';
import { CHART_KATEGORI_COLORS } from '@/lib/colors';
import type { Distribusi } from '@/types/statistik';

/**
 * Lantai lebar bar (%). Kategori berisi satu orang di antara ratusan
 * menghasilkan bar setipis rambut yang terbaca sebagai "kosong"; besaran
 * persisnya tetap disampaikan angka di kolom kanan.
 */
const LEBAR_BAR_MINIMUM_PERSEN = 2;

function lebarBar(nilai: number, maks: number): string {
  if (nilai <= 0) return '0%';
  return `${Math.max((nilai / maks) * 100, LEBAR_BAR_MINIMUM_PERSEN)}%`;
}

/**
 * Distribusi kategori sebagai daftar baris: label, bar, cacah.
 *
 * HTML + CSS, BUKAN Recharts — jangan dikembalikan ke library. Tiga kolom lurus
 * ke bawah justru yang paling mahal di SVG: lebar kolom label harus dipatok
 * mati (kartu 7 baris dan 8 baris tidak akan pernah sejajar), teks SVG tidak
 * ikut skala tipe aplikasi yang sengaja dinaikkan untuk pembaca berumur, dan
 * tidak terbaca screen reader. `<dl>` di sini dibacakan sebagai pasangan
 * label -> cacah; barnya `aria-hidden` karena cuma bentuk visual angka
 * di sebelahnya.
 *
 * Tiap bar diwarnai dari `CHART_KATEGORI_COLORS` (sama seperti irisan pie
 * chart) supaya baris tidak seragam satu warna — perbandingan tetap dibawa
 * panjang bar + angka di kanan, warnanya cuma penanda baris.
 */
export function DistribusiBarChart({ data }: { data: Distribusi[] }) {
  // Dashboard pengurus mengoper `[]` sebelum agregatnya ada. `<dl>` kosong
  // menyusut jadi nol tinggi — kartunya terbaca rusak, bukan kosong.
  if (data.length === 0) {
    return <p className="text-sm text-slate-500">Belum ada data.</p>;
  }

  // `1` sebagai penyebut cadangan: semua nilai nol tidak boleh menghasilkan
  // lebar `NaN%`.
  const maks = Math.max(...data.map((d) => d.value), 1);

  return (
    <dl className="grid grid-cols-[auto_1fr_auto] items-center gap-x-4 gap-y-3.5">
      {data.map((d, i) => (
        <Fragment key={d.label}>
          <dt className="text-sm font-semibold text-slate-600">{d.label}</dt>
          <dd
            className="h-2.5 overflow-hidden rounded-sm bg-slate-100"
            aria-hidden
          >
            {/* Bar melebar/menyempit saat pindah RT — perpindahan panjangnya
                yang membawa perbandingannya, bukan dua gambar terpisah. */}
            <div
              className="h-full rounded-sm transition-[width] duration-500 ease-out motion-reduce:transition-none"
              style={{
                width: lebarBar(d.value, maks),
                backgroundColor:
                  CHART_KATEGORI_COLORS[i % CHART_KATEGORI_COLORS.length],
              }}
            />
          </dd>
          <dd className="text-right text-sm font-semibold tabular-nums text-slate-900">
            {d.value}
          </dd>
        </Fragment>
      ))}
    </dl>
  );
}
