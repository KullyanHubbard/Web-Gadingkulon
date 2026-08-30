/**
 * Keterangan tetap Padukuhan Gading Kulon: yang tidak berubah tiap hari dan
 * karena itu tidak perlu tabel maupun endpoint.
 *
 * Dipakai beranda dan halaman profil. Di `lib`, bukan di dalam salah satu
 * fitur, karena dua halaman berbeda memakainya (CLAUDE.md §4).
 *
 * ponytail: konstanta, bukan CMS. Pindahkan ke tabel kalau perangkat desa
 * ternyata ingin menyuntingnya sendiri tanpa deploy ulang.
 */

export const PADUKUHAN = {
  nama: 'Gading Kulon',
  namaLengkap: 'Padukuhan Gading Kulon',
  desa: 'Kalurahan Gading',
  kapanewon: 'Kapanewon Playen',
  kabupaten: 'Kabupaten Gunungkidul',
  provinsi: 'Daerah Istimewa Yogyakarta',
  luasWilayah: '162,4 ha',
  /**
   * Titik tengah peta. Ubah dua angka ini kalau petanya meleset — seluruh
   * embed peta di situs ini membacanya dari sini.
   */
  koordinat: { lat: -7.9264, lon: 110.5527 },
  /** Radius kotak peta dalam derajat; ±0,012° ≈ 1,3 km. */
  radiusPeta: 0.012,
} as const;

export const SEJARAH_PADUKUHAN = [
  `Gading Kulon adalah salah satu padukuhan di ${PADUKUHAN.desa}, ${PADUKUHAN.kapanewon}, ${PADUKUHAN.kabupaten}. Namanya diambil dari pohon gading yang dahulu tumbuh di sisi barat kalurahan — "kulon" berarti barat dalam bahasa Jawa.`,
  'Sejak awal berdirinya, warga Gading Kulon hidup dari pertanian lahan kering: padi gogo, jagung, kacang tanah, dan ubi kayu. Lapangan terbang Gading di sisi utara kalurahan menjadikan wilayah ini titik lalu lintas yang cukup ramai untuk ukuran Gunungkidul.',
  'Hari ini Gading Kulon berkembang tanpa meninggalkan gotong royong yang jadi wataknya: kerja bakti rutin, ronda malam bergilir, dan kegiatan Karang Taruna yang menggerakkan warga muda. Portal ini dibuat agar data kependudukan padukuhan bisa dibaca dengan cepat, oleh pengurus maupun warga.',
];

export interface BatasWilayah {
  arah: 'Utara' | 'Timur' | 'Selatan' | 'Barat';
  wilayah: string;
}

export const BATAS_WILAYAH: BatasWilayah[] = [
  { arah: 'Utara', wilayah: 'Padukuhan Gading Lor' },
  { arah: 'Timur', wilayah: 'Padukuhan Gading Wetan' },
  { arah: 'Selatan', wilayah: 'Padukuhan Ngipak' },
  { arah: 'Barat', wilayah: 'Kalurahan Banyusoco' },
];

/**
 * Bagan struktur organisasi. Nama pengurus TIDAK diambil dari tabel `pengurus`
 * — daftar akun itu ada di balik login ADMIN, dan halaman ini terbuka untuk
 * siapa saja. Yang boleh dipublikasikan disetel manual di sini.
 */
export interface PosisiOrganisasi {
  jabatan: string;
  nama: string;
  /** Anak buah langsung; kosong bila posisi terakhir di cabangnya. */
  bawahan?: PosisiOrganisasi[];
}

export const STRUKTUR_ORGANISASI: PosisiOrganisasi = {
  jabatan: 'Dukuh',
  nama: 'Sujarwo',
  bawahan: [
    {
      jabatan: 'Ketua RW 01',
      nama: 'Bambang Riyanto',
      bawahan: [
        { jabatan: 'Ketua RT 01', nama: 'Slamet Widodo' },
        { jabatan: 'Ketua RT 02', nama: 'Marjuki' },
      ],
    },
    {
      jabatan: 'Ketua RW 02',
      nama: 'Sunarto',
      bawahan: [
        { jabatan: 'Ketua RT 03', nama: 'Agus Purwanto' },
        { jabatan: 'Ketua RT 04', nama: 'Tukiman' },
      ],
    },
    {
      jabatan: 'Ketua Karang Taruna',
      nama: 'Rizal Fahrezi',
      bawahan: [
        { jabatan: 'Sekretaris', nama: 'Nur Aisyah' },
        { jabatan: 'Bendahara', nama: 'Dwi Lestari' },
      ],
    },
  ],
};
