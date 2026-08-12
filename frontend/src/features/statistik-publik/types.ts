import type { Distribusi } from '@/types/statistik';

/**
 * Agregat kependudukan yang boleh dilihat siapa pun, termasuk sebelum masuk.
 *
 * Sengaja hanya berisi cacah — tidak ada NIK, nama, atau alamat. Apa pun yang
 * ditambahkan ke sini otomatis menjadi konsumsi publik, jadi tambahkan hanya
 * angka yang memang layak dipajang di halaman depan.
 */
export interface StatistikPublik {
  totalPenduduk: number;
  /** Jumlah jiwa per RW, urut menaik menurut nomor RW. */
  perRw: Distribusi[];
}
