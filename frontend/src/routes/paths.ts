/** Sumber tunggal kebenaran untuk path routing. */
export const paths = {
  /** Landing publik: statistik padukuhan, tanpa auth. */
  landing: '/',
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
    /** Riwayat perubahan. Isinya beda menurut peran; lihat RiwayatPage. */
    riwayat: '/admin/riwayat',
  },
} as const;
