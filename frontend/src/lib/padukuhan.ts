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
  desa: 'Donokerto',
  kapanewon: 'Kapanewon Turi',
  kabupaten: 'Sleman',
  provinsi: 'Daerah Istimewa Yogyakarta',
  luasWilayah: '162,4 ha',
  /** Kontak resmi padukuhan — dicetak di footer & jadi tujuan tombol Pengaduan. */
  telepon: '+62 812-2761-391',
  email: 'gadingkulon@gmail.com',
  /**
   * Titik tengah peta (Donokerto, Kec. Turi, Sleman).
   */
  koordinat: { lat: -7.6256, lon: 110.3789 },
  /** Radius kotak peta dalam derajat; ±0,012° ≈ 1,3 km. */
  radiusPeta: 0.012,
} as const;

export const SEJARAH_PADUKUHAN = [
  `Gading Kulon adalah salah satu padukuhan di Kalurahan ${PADUKUHAN.desa}, ${PADUKUHAN.kapanewon}, ${PADUKUHAN.kabupaten}, ${PADUKUHAN.provinsi}.`,
  'Sejak awal berdirinya, warga Gading Kulon hidup produktif berlandaskan kebersamaan, pertanian, dan potensi lokal daerah lereng Gunung Merapi.',
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
