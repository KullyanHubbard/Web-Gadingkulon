import colors from 'tailwindcss/colors';

/**
 * Palet NIA bersifat TERTUTUP.
 *
 * `theme.colors` sengaja MENGGANTI (bukan `extend`) palet bawaan Tailwind, jadi
 * warna di luar daftar ini tidak menghasilkan class sama sekali — `bg-blue-600`
 * atau `text-emerald-500` mati, bukan sekadar "tidak dianjurkan". Ini yang
 * menjaga warna tidak berubah-ubah seiring bertambahnya halaman.
 *
 * Butuh warna baru? Tambahkan di sini dulu, dengan alasan yang jelas.
 * Jangan menambal lewat hex di komponen.
 *
 * @type {import('tailwindcss').Config}
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    colors: {
      // Kata kunci CSS — bukan bagian palet, tapi dibutuhkan Tailwind.
      inherit: colors.inherit,
      current: colors.current,
      transparent: colors.transparent,
      white: colors.white,
      black: colors.black,

      // Brand NIA — nuansa "pemerintahan desa" yang tenang & terpercaya.
      brand: {
        50: '#eef6ff',
        100: '#d9eaff',
        200: '#bcdaff',
        300: '#8ec2ff',
        400: '#589fff',
        500: '#317bff',
        600: '#1a5cf5',
        700: '#1546e1',
        800: '#183bb6',
        900: '#19388f',
        950: '#142457',
      },

      // Netral tunggal. Jangan campur dengan gray/zinc/neutral/stone.
      slate: colors.slate,

      // Semantik status. Pakai sesuai makna, bukan sesuai selera visual.
      red: colors.red, // error, danger, aksi merusak
      green: colors.green, // sukses, status aktif
      amber: colors.amber, // peringatan
      violet: colors.violet, // aksen statistik netral (StatCard)
    },
    extend: {
      // Tanpa palet bawaan, `borderColor.DEFAULT` jatuh ke `currentColor`.
      // Pin ke netral supaya `border` polos tetap terlihat benar.
      borderColor: ({ theme }) => ({
        DEFAULT: theme('colors.slate.200'),
      }),
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
