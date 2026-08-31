import type { Distribusi } from '@/types/statistik';

/**
 * Rincian satu wilayah: sebuah RW, atau satu RT di dalamnya. Bentuknya
 * rekursif & sama untuk keduanya, jadi satu komponen panel melayani dua-duanya.
 * Kedalamannya cuma dua: `perRt` pada entri RT selalu kosong.
 *
 * Label pada tiap `Distribusi` masih enum mentah (`'ISLAM'`, `'SMA'`) —
 * peta enum -> teks tinggal di `features/penduduk/labels.ts`, dan fitur tidak
 * boleh saling impor (CLAUDE.md §4), jadi penerjemahannya di level halaman.
 */
export interface RincianRw {
  /** Mis. `'RW 19'` atau `'RT 1'` — sudah berbentuk tampilan. */
  label: string;
  totalPenduduk: number;
  /** Turunan `statusHubunganKeluarga`, sama seperti di `StatistikPublik`. */
  totalKepalaKeluarga: number;
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
 * Agregat yang boleh dilihat siapa pun, termasuk sebelum masuk.
 *
 * Hanya cacah — tidak ada nama maupun alamat. Apa pun yang ditambahkan ke
 * sini otomatis menjadi konsumsi publik.
 */
export interface StatistikPublik {
  /**
   * Bulan paling lampau yang datanya bisa dipertanggungjawabkan, `YYYY-MM`.
   * Buku mutasi baru mulai ditulis saat fitur periode dipasang, jadi batas ini
   * datang dari backend — bukan dikarang frontend.
   */
  periodeTerawal: string;
  totalPenduduk: number;
  totalLakiLaki: number;
  totalPerempuan: number;
  /**
   * Cacah kepala keluarga — dipakai beranda sebagai "Jumlah KK". Nomor KK
   * sendiri tidak didata lagi, jadi ini turunan `statusHubunganKeluarga`,
   * bukan hitungan kartu keluarga yang sebenarnya.
   */
  totalKepalaKeluarga: number;
  /** Sepuluh pekerjaan terbanyak se-padukuhan; isinya teks bebas. */
  perPekerjaan: Distribusi[];
  /** Rincian per RW, urut menaik menurut nomor RW. */
  perRw: RincianRw[];
}
