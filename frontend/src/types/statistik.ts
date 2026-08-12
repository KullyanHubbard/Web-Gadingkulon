/**
 * Bentuk data agregat yang dipakai lintas fitur.
 *
 * Tinggal di `types/` (bukan di dalam salah satu fitur) karena dua fitur
 * memproduksinya — `infografis` untuk pengurus, `statistik-publik` untuk halaman
 * masuk — dan komponen chart di `components/ui` mengonsumsinya. CLAUDE.md §4:
 * apa pun yang dibagi antar fitur dinaikkan ke `types`/`lib`/`components`.
 */

/** Satu kategori beserta cacahnya, mis. `{ label: 'RW 19', value: 14 }`. */
export interface Distribusi {
  label: string;
  value: number;
}
