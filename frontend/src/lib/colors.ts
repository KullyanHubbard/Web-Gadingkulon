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

/** Urutan warna seri chart. Dipakai bergilir (modulo) untuk kategori. */
export const CHART_SERIES_COLORS = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
  'var(--chart-7)',
] as const;

/** Warna label sumbu chart. */
export const CHART_AXIS_COLOR = 'var(--chart-axis)';

/** Warna sorotan (hover) di belakang batang chart. */
export const CHART_CURSOR_COLOR = 'var(--chart-cursor)';
