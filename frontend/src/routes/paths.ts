/** Sumber tunggal kebenaran untuk path routing. */
export const paths = {
  /** Landing publik: statistik padukuhan, tanpa auth. */
  landing: '/',
  /** Halaman masuk warga (NIK + PIN). */
  login: '/login',
  /** Masuk khusus pengurus (Dukuh/RW/RT). */
  loginPetugas: '/login/petugas',
  /** Aktivasi akun warga: NIK + tanggal lahir, lalu buat PIN. */
  aktivasi: '/aktivasi',
  beranda: '/beranda',
  /** Form kontak opsional (nomor HP & email) milik warga. */
  kontak: '/kontak',
  admin: {
    root: '/admin',
    penduduk: '/admin/penduduk',
    infografis: '/admin/infografis',
  },
} as const;
