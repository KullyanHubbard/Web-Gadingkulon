/** Sumber tunggal kebenaran untuk path routing. */
export const paths = {
  /** Beranda publik: hero, jelajah, ringkasan, peta, berita terkini. */
  landing: '/',
  /** Profil padukuhan: sejarah, struktur organisasi, batas wilayah. */
  profil: '/profil',
  /** Infografis publik: demografi + bantuan sosial. */
  infografis: '/infografis',
  /** Daftar berita publik. */
  berita: '/berita',
  /** Satu berita. Slug-nya diturunkan dari judul saat berita dibuat. */
  beritaDetail: (slug: string) => `/berita/${slug}`,
  /**
   * Statistik warga per RW/RT — halaman rail kiri yang dulu menempati `/`.
   * Dipindah ke path sendiri saat beranda diisi landing page; tautan lama ke
   * `/?rw=...` jadi mati, dan itu diterima: portalnya belum dipublikasikan.
   */
  statistik: '/statistik',
  /** Masuk perangkat desa — satu-satunya jalur masuk. */
  login: '/login',
  /** Ganti password sendiri; wajib sekali untuk akun yang baru dibuatkan. */
  gantiPassword: '/ganti-password',
  admin: {
    root: '/admin',
    penduduk: '/admin/penduduk',
    infografis: '/admin/infografis',
    /** Kelola akun pengurus. ADMIN saja. */
    pengurus: '/admin/pengurus',
    /** Tulis & sunting berita padukuhan. DUKUH saja. */
    berita: '/admin/berita',
    /** Riwayat perubahan. Isinya beda menurut peran; lihat RiwayatPage. */
    riwayat: '/admin/riwayat',
  },
} as const;
