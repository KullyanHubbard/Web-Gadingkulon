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

/**
 * Warna teks untuk label yang dicetak DI ATAS irisan seri, sejajar indeksnya
 * dengan `CHART_SERIES_COLORS`. Pasangannya ditentukan di `styles/index.css`.
 */
const CHART_SERIES_TEXT_COLORS = [
  'var(--chart-1-text)',
  'var(--chart-2-text)',
  'var(--chart-3-text)',
  'var(--chart-4-text)',
  'var(--chart-5-text)',
  'var(--chart-6-text)',
  'var(--chart-7-text)',
] as const;

/** Warna seri ke-`index`, berputar bila kategorinya lebih banyak dari warnanya. */
export function warnaSeri(index: number): string {
  return CHART_SERIES_COLORS[index % CHART_SERIES_COLORS.length];
}

/** Warna teks yang kontras di atas `warnaSeri(index)`. */
export function warnaTeksSeri(index: number): string {
  return CHART_SERIES_TEXT_COLORS[index % CHART_SERIES_TEXT_COLORS.length];
}

/** Warna label sumbu chart. */
export const CHART_AXIS_COLOR = 'var(--chart-axis)';

/** Warna sorotan (hover) di belakang batang chart. */
export const CHART_CURSOR_COLOR = 'var(--chart-cursor)';
