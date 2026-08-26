/** Sumber tunggal kebenaran untuk path routing. */
export const paths = {
  /** Landing publik: statistik padukuhan, tanpa auth. */
  landing: '/',
  /** Masuk pengurus (Dukuh/RW/RT) — satu-satunya jalur masuk. */
  login: '/login',
  admin: {
    root: '/admin',
    penduduk: '/admin/penduduk',
    infografis: '/admin/infografis',
    /** Kelola akun pengurus. ADMIN saja. */
    pengurus: '/admin/pengurus',
  },
} as const;
