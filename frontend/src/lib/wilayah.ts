/** Format satuan wilayah (RT/RW) untuk ditampilkan. */

/**
 * `'019'` → `'19'`, `'001'` → `'01'`.
 *
 * Nol di depan adalah format penyimpanan yang mengikuti kartu keluarga (tiga
 * digit); yang dibaca orang dua digit. Nomor tiga digit sungguhan (`'100'`)
 * tidak dipotong.
 */
function duaDigit(kode: string): string {
  return (kode.replace(/^0+/, '') || '0').padStart(2, '0');
}

/** `'019'` → `'RW 19'` — cerminan `format_rw` di `backend/app/data/agregat.py`. */
export function formatRw(rw: string): string {
  return `RW ${duaDigit(rw)}`;
}

/** `'001'` → `'RT 01'`. */
export function formatRt(rt: string): string {
  return `RT ${duaDigit(rt)}`;
}
