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
 * Urutan warna seri chart. Dipakai bergilir (modulo) untuk kategori.
 *
 * Urutannya sengaja selang-seling gelap–terang (lihat `styles/index.css`) supaya
 * dua irisan donut yang bersebelahan tidak nyaris kembar.
 */
export const CHART_SERIES_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
  'var(--chart-7)',
] as const;

/** Warna seri ke-`index`, berputar bila kategorinya lebih banyak dari warnanya. */
export function warnaSeri(index: number): string {
  return CHART_SERIES_COLORS[index % CHART_SERIES_COLORS.length];
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

/** Warna sorotan (hover) di belakang batang chart. */
export const CHART_CURSOR_COLOR = 'var(--chart-cursor)';
