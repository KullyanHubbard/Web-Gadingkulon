/**
 * Token warna untuk library yang menerima nilai warna, bukan class Tailwind
 * (mis. Recharts: `fill`, `stroke`).
 *
 * Nilainya sengaja berupa `var(--…)` yang didefinisikan di `styles/index.css`
 * dari `theme('colors.…')`. Jadi palet tetap satu sumber kebenaran di
 * `tailwind.config.js` — ubah di sana, chart ikut berubah.
 *
 * JANGAN menulis hex di file ini.
 */

/**
 * Ramp ORDINAL — untuk kategori yang punya urutan (kelompok umur, jenjang
 * pendidikan). Satu hue, terang -> gelap. Alasan tiap langkahnya di
 * `tailwind.config.js`.
 */
export const CHART_ORDINAL_COLORS = [
  'var(--chart-ordinal-1)',
  'var(--chart-ordinal-2)',
  'var(--chart-ordinal-3)',
  'var(--chart-ordinal-4)',
  'var(--chart-ordinal-5)',
  'var(--chart-ordinal-6)',
  'var(--chart-ordinal-7)',
  'var(--chart-ordinal-8)',
] as const;

/**
 * Warna KATEGORIK — untuk kategori tanpa urutan (agama, status perkawinan).
 * Enam hue berbeda; identitasnya dibawa hue, bukan gelap-terang.
 *
 * Enam adalah batasnya, bukan awalnya: kategori ke-7 digabung jadi "Lainnya",
 * jangan dikarang warna baru (lihat `tailwind.config.js`).
 */
export const CHART_KATEGORI_COLORS = [
  'var(--chart-kategori-1)',
  'var(--chart-kategori-2)',
  'var(--chart-kategori-3)',
  'var(--chart-kategori-4)',
  'var(--chart-kategori-5)',
  'var(--chart-kategori-6)',
] as const;

/**
 * Warna ordinal ke-`index` dari `total` kategori, gelap -> terang.
 *
 * Rampnya DIBENTANGKAN sepanjang jumlah kategori, bukan diambil dari ujung:
 * chart 4 kategori yang memakai slot 1-4 saja akan jadi empat biru muda yang
 * mirip semua. Dengan dibentangkan, berapa pun jumlah kategorinya (sampai 8)
 * selisih antar batang tetap selebar mungkin — dan tidak pernah ada dua batang
 * bewarna sama.
 *
 * Gelap duluan: data sudah terurut menurun, jadi yang terbanyak paling pekat.
 */
export function warnaOrdinal(index: number, total: number): string {
  const akhir = CHART_ORDINAL_COLORS.length - 1;
  if (total <= 1) return CHART_ORDINAL_COLORS[akhir];
  const langkah = Math.round((index / (total - 1)) * akhir);
  return CHART_ORDINAL_COLORS[akhir - Math.min(langkah, akhir)];
}

/** Ramp indigo khusus donut RW (statistik publik), tua->muda. */
export const CHART_RW_COLORS = [
  'var(--chart-rw-1)',
  'var(--chart-rw-2)',
  'var(--chart-rw-3)',
] as const;

/** Warna teks label yang dicetak DI ATAS irisan donut — selalu putih polos. */
export const CHART_SLICE_LABEL_COLOR = 'var(--chart-slice-label)';

/** Warna label sumbu chart. */
export const CHART_AXIS_COLOR = 'var(--chart-axis)';

/**
 * Warna teks legenda. Sengaja token teks, bukan warna seri: seri terang tidak
 * punya kontras yang cukup untuk dibaca sebagai huruf. Identitasnya dibawa
 * bulatan berwarna di sebelah teks.
 */
export const CHART_LEGEND_TEXT_COLOR = 'var(--chart-legend-text)';
