/** Satu artikel berita padukuhan. */
export interface Berita {
  id: string;
  /** Turunan dari judul; jadi bagian URL `/berita/:slug`. Unik. */
  slug: string;
  judul: string;
  /** URL foto utama: data URL hasil unggah, atau kosong kalau tanpa foto. */
  foto: string;
  /** ISO date (`YYYY-MM-DD`) — tanggal, bukan waktu; jamnya tidak dipakai. */
  tanggalTerbit: string;
  penulis: string;
  /** Isi artikel, teks polos. Baris kosong memisahkan paragraf. */
  isi: string;
}

/** Berita yang dikirim form. `id` & `slug` dibuat lapisan penyimpanan. */
export type BeritaBaru = Omit<Berita, 'id' | 'slug'>;
