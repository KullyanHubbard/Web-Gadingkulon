import type { Berita, BeritaBaru } from '../types';
import { slugUnik, urutTerbaru } from '../utils';

/**
 * Kontrak berita — bentuknya sama seperti `*Api` fitur lain, tapi
 * implementasinya menulis ke `localStorage`, BUKAN ke backend.
 *
 * Alasannya: belum ada tabel maupun endpoint berita di FastAPI, dan foto utama
 * berarti penyimpanan berkas — dua pekerjaan yang jauh lebih besar daripada
 * halamannya sendiri. Kontrak ini yang membuat pindahnya nanti murah: ganti
 * isi `beritaApi` dengan panggilan `apiClient`, komponen & hook tidak berubah
 * satu baris pun.
 *
 * ponytail: `localStorage` = per-peramban. Berita yang ditulis Dukuh TIDAK
 * terlihat oleh pengunjung lain, dan kuotanya ±5 MB (foto ikut dihitung, lihat
 * `simpan`). Pindahkan ke tabel `berita` + endpoint unggah begitu portalnya
 * benar-benar dipublikasikan.
 */
export interface BeritaApi {
  list(): Promise<Berita[]>;
  getBySlug(slug: string): Promise<Berita | null>;
  simpan(input: BeritaBaru, id?: string): Promise<Berita>;
  hapus(id: string): Promise<void>;
}

const KUNCI = 'siduk.berita';

/** Contoh isi untuk pemasangan baru, supaya halaman berita tidak kosong melompong. */
const CONTOH: Berita[] = [
  {
    id: 'contoh-1',
    slug: 'kerja-bakti-bersih-lingkungan-rw-01',
    judul: 'Kerja Bakti Bersih Lingkungan RW 01',
    foto: '',
    tanggalTerbit: '2026-08-24',
    penulis: 'Karang Taruna Gading Kulon',
    isi: 'Warga RW 01 menggelar kerja bakti membersihkan saluran air dan jalan padukuhan pada Minggu pagi. Kegiatan diikuti lebih dari lima puluh warga dari empat RT.\n\nSelain membersihkan saluran, warga juga mengecat ulang gapura dan memangkas pohon yang menutupi lampu jalan. Kerja bakti direncanakan berlangsung rutin setiap bulan.',
  },
  {
    id: 'contoh-2',
    slug: 'posyandu-balita-agustus',
    judul: 'Posyandu Balita Agustus: 62 Anak Terpantau',
    foto: '',
    tanggalTerbit: '2026-08-14',
    penulis: 'Kader Posyandu',
    isi: 'Posyandu balita bulan Agustus dilaksanakan di balai padukuhan dan diikuti 62 anak. Petugas mencatat berat badan, tinggi badan, serta memberi vitamin A.\n\nOrang tua diminta membawa buku KIA pada kunjungan berikutnya agar catatan pertumbuhan anak tetap lengkap.',
  },
  {
    id: 'contoh-3',
    slug: 'penyaluran-bantuan-pangan-non-tunai',
    judul: 'Penyaluran Bantuan Pangan Non-Tunai Tahap III',
    foto: '',
    tanggalTerbit: '2026-08-05',
    penulis: 'Sekretariat Padukuhan',
    isi: 'Bantuan Pangan Non-Tunai tahap III disalurkan kepada keluarga penerima manfaat di balai padukuhan. Penyaluran dilakukan bertahap per RT untuk menghindari antrean panjang.\n\nWarga yang merasa berhak namun belum terdaftar dapat melapor ke Ketua RT masing-masing untuk didata pada tahap berikutnya.',
  },
];

function baca(): Berita[] {
  try {
    const mentah = localStorage.getItem(KUNCI);
    if (mentah === null) return CONTOH;
    const isi: unknown = JSON.parse(mentah);
    return Array.isArray(isi) ? (isi as Berita[]) : [];
  } catch {
    // Isi rusak atau `localStorage` diblokir peramban: portal tetap harus
    // terbuka, jadi jatuh ke daftar kosong alih-alih melempar.
    return [];
  }
}

function tulis(daftar: Berita[]): void {
  localStorage.setItem(KUNCI, JSON.stringify(daftar));
}

export const beritaApi: BeritaApi = {
  async list() {
    return urutTerbaru(baca());
  },

  async getBySlug(slug) {
    return baca().find((b) => b.slug === slug) ?? null;
  },

  async simpan(input, id) {
    const daftar = baca();
    const slug = slugUnik(input.judul, daftar, id);

    if (id !== undefined) {
      const i = daftar.findIndex((b) => b.id === id);
      if (i === -1) throw new Error('Berita tidak ditemukan.');
      // Slug ikut berubah saat judul disunting: tautan lama jadi mati, dan itu
      // dipilih sadar daripada URL yang bertentangan dengan judulnya.
      daftar[i] = { ...daftar[i], ...input, slug };
      tulis(daftar);
      return daftar[i];
    }

    const baru: Berita = { ...input, id: crypto.randomUUID(), slug };
    tulis([baru, ...daftar]);
    return baru;
  },

  async hapus(id) {
    tulis(baca().filter((b) => b.id !== id));
  },
};
