import type { PanelDistribusi } from '@/types/statistik';

/**
 * Data penerima bantuan sosial.
 *
 * KONSTANTA, bukan hasil query: tabel `penduduk` tidak menyimpan status
 * penerima bantuan sama sekali, jadi tidak ada apa pun untuk diagregasi. Angka
 * di bawah adalah CONTOH supaya bentuk halamannya bisa dilihat dan disetujui
 * perangkat desa lebih dulu.
 *
 * ponytail: ganti dengan endpoint `/publik/bansos` begitu kolom penerima
 * bantuan benar-benar didata. Bentuk `PanelDistribusi` di sini sudah sama
 * dengan yang dipakai panel demografi, jadi hanya berkas ini yang berubah.
 */

export const TOTAL_PENERIMA_BANSOS = 214;

export const PANEL_BANSOS: PanelDistribusi[] = [
  {
    id: 'jenis-bansos',
    judul: 'Penerima per Jenis Bantuan',
    deskripsi: 'Jumlah keluarga penerima manfaat menurut program',
    jenis: 'bar',
    data: [
      { label: 'BPNT / Sembako', value: 86 },
      { label: 'PKH', value: 54 },
      { label: 'BLT Dana Desa', value: 38 },
      { label: 'PBI-JK (KIS)', value: 21 },
      { label: 'PIP (Kartu Indonesia Pintar)', value: 15 },
    ],
  },
  {
    id: 'bansos-per-rw',
    judul: 'Sebaran Penerima per RW',
    deskripsi: 'Keluarga penerima manfaat di tiap Rukun Warga',
    jenis: 'pie',
    data: [
      { label: 'RW 01', value: 62 },
      { label: 'RW 02', value: 58 },
      { label: 'RW 03', value: 51 },
      { label: 'RW 04', value: 43 },
    ],
  },
  {
    id: 'kategori-penerima',
    judul: 'Kategori Penerima',
    deskripsi: 'Latar belakang keluarga penerima manfaat',
    jenis: 'bar',
    data: [
      { label: 'Lansia', value: 71 },
      { label: 'Keluarga dengan balita', value: 58 },
      { label: 'Keluarga dengan anak sekolah', value: 46 },
      { label: 'Penyandang disabilitas', value: 19 },
      { label: 'Lainnya', value: 20 },
    ],
    lebarPenuh: true,
  },
];
