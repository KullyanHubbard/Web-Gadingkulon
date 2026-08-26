import type { AuthUser } from './types';

/**
 * Wilayah yang datanya sedang ditampilkan untuk pengurus ini.
 *
 * Sejak batas wilayah berlaku, angka yang dilihat Ketua RT bukan lagi angka
 * padukuhan — dan tanpa keterangan ini, "125 jiwa" mudah dikira jumlah
 * se-padukuhan. Backend yang menyaring; ini cuma memberi tahu apa yang tersaring.
 */
export function labelWilayah(user: AuthUser | null): string {
  if (!user) return '';
  if (user.role === 'RT') return `RT ${user.rt} / RW ${user.rw}`;
  if (user.role === 'RW') return `RW ${user.rw}`;
  return 'seluruh padukuhan';
}
