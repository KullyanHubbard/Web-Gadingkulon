/**
 * Bagan pengurus untuk halaman profil publik.
 *
 * Bentuknya cermin `StrukturOrganisasiPublik` backend — dua sisi menjaga
 * bentuk yang sama, lihat CLAUDE.md §11. `nama: null` berarti jabatan itu
 * belum ada akun aktifnya; komponen yang menandainya "Belum diisi".
 */
export interface JabatanWilayahPublik {
  /** Nomor wilayah apa adanya dari data, mis. `'019'` atau `'19'`. */
  nomor: string;
  nama: string | null;
}

export interface RwPublik extends JabatanWilayahPublik {
  rt: JabatanWilayahPublik[];
}

export interface StrukturOrganisasiPublik {
  dukuh: string | null;
  rw: RwPublik[];
  lpm: string | null;
}
