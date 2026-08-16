import type { Distribusi } from '@/types/statistik';

/**
 * Rincian satu wilayah: sebuah RW, atau satu RT di dalamnya.
 *
 * Bentuknya rekursif dan sengaja sama untuk RW & RT, jadi satu komponen panel
 * bisa menampilkan keduanya. Kedalamannya cuma dua: `perRt` pada entri RT
 * selalu kosong.
 *
 * Label pada tiap `Distribusi` masih enum mentah (`'ISLAM'`, `'SMA'`) —
 * sengaja: peta enum -> teks tampilan tinggal di `features/penduduk/labels.ts`,
 * dan fitur tidak boleh saling impor (CLAUDE.md §4). Penerjemahannya terjadi di
 * level halaman, sama seperti infografis admin.
 */
export interface RincianRw {
  /** Mis. `'RW 19'` atau `'RT 1'` — sudah berbentuk tampilan. */
  label: string;
  totalPenduduk: number;
  totalKK: number;
  totalLakiLaki: number;
  totalPerempuan: number;
  perKelompokUmur: Distribusi[];
  perPendidikan: Distribusi[];
  perAgama: Distribusi[];
  perStatusPerkawinan: Distribusi[];
  /** Rincian tiap RT di wilayah ini, urut menaik menurut nomor RT. */
  perRt: RincianRw[];
}

/**
 * Agregat kependudukan yang boleh dilihat siapa pun, termasuk sebelum masuk.
 *
 * Sengaja hanya berisi cacah — tidak ada NIK, nama, atau alamat. Apa pun yang
 * ditambahkan ke sini otomatis menjadi konsumsi publik, jadi tambahkan hanya
 * angka yang memang layak dipajang di halaman depan.
 */
export interface StatistikPublik {
  totalPenduduk: number;
  /**
   * Se-desa, bukan jumlah dari `perRw`: satu nomor KK yang anggotanya terpisah
   * RW akan terhitung dua kali kalau dijumlahkan sendiri di sini.
   */
  totalKK: number;
  totalLakiLaki: number;
  totalPerempuan: number;
  /** Rincian per RW, urut menaik menurut nomor RW. */
  perRw: RincianRw[];
}
