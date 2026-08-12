/** Format satuan wilayah (RT/RW) untuk ditampilkan. */

/**
 * `'019'` → `'RW 19'`.
 *
 * Nol di depan adalah format penyimpanan yang mengikuti kartu keluarga, bukan
 * cara orang menyebutnya. Warga bilang "RW 19", jadi begitu pula layarnya.
 */
export function formatRw(rw: string): string {
  return `RW ${rw.replace(/^0+/, '') || rw}`;
}
