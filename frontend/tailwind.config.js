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

      // Ramp donut RW (statistik publik). Hanya 3 shade yang dipakai — sengaja
      // tidak buka seluruh skala indigo agar palet tetap tertutup.
      indigo: {
        300: colors.indigo[300],
        500: colors.indigo[500],
        800: colors.indigo[800],
      },

      /* Warna khusus chart. Dipisah dari `brand` karena tugasnya beda: brand
         menandai aksi & aksen, ini menandai DATA — dan data punya dua jenis
         yang tidak boleh tertukar.

         Tidak boleh dipakai sebagai warna UI biasa (tombol, badge, teks).
         Bukan juga warna semantik: `kategori.5` kebetulan hijau, tapi tidak
         berarti "sukses". */
      chart: {
        /* ORDINAL — kategori yang punya URUTAN (kelompok umur, jenjang
           pendidikan). Satu hue (hue brand, 264°), lightness turun rata:
           pembacanya melihat urutannya di warnanya sendiri.

           Dibangkitkan di OKLCH pada ΔL = 0,064 lalu di-clip ke sRGB, bukan
           dikira-kira. Tervalidasi: lightness monoton, tiap langkah ΔL >= 0,06,
           ujung paling terang 2,06:1 di atas putih. Jangan sisipkan langkah
           baru di tengah tanpa menghitung ulang — jaraknya sudah mepet floor.

           Nomor kecil = terang, mengikuti kebiasaan skala Tailwind. */
        ordinal: {
          1: '#8eb5ff',
          2: '#6e9eff',
          3: '#4e86ff',
          4: '#3b72e9',
          5: '#295ed3',
          6: '#1749bd',
          7: '#0434a8',
          8: '#002588',
        },

        /* KATEGORIK — kategori TANPA urutan (agama, status perkawinan). Enam
           hue berbeda; identitas dibawa hue, bukan gelap-terang.

           Enam, bukan lebih: itu jumlah kategori terbanyak yang ada (6 agama).
           Warna ke-7 tidak boleh dikarang — kategori berikutnya digabung jadi
           "Lainnya". Urutan slotnya BUKAN selera: dicari dengan memaksimalkan
           jarak pasangan bersebelahan. Tervalidasi di atas putih — kontras
           semua >= 3:1, jarak terburuk protan/deutan ΔE 12,2 (target 8),
           penglihatan normal ΔE 16,0 (floor 15). Menukar urutannya merusak
           angka itu. */
        kategori: {
          1: '#295ed3', // biru (serumpun brand)
          2: '#00908a', // toska
          3: '#c07a15', // oker
          4: '#c2557a', // mawar
          5: '#7c4dbf', // plum
          6: '#2e8b3d', // hijau
        },
      },
    },
    extend: {
      // Tanpa palet bawaan, `borderColor.DEFAULT` jatuh ke `currentColor`.
      // Pin ke netral supaya `border` polos tetap terlihat benar.
      borderColor: ({ theme }) => ({
        DEFAULT: theme('colors.slate.200'),
      }),
      // Garis tepi 1px terlalu samar di layar HP murah & mata yang sudah tua —
      // pembacanya warga padukuhan, sama alasannya dengan skala tipe di bawah.
      // Dinaikkan di token, bukan disisir per komponen: setiap `border`,
      // `border-b`, `border-r`, dan `divide-y` yang sudah tertulis ikut tebal,
      // jadi tidak ada yang terlewat dan tidak ada yang tertinggal 1px.
      // Aman untuk layout: semua tinggi dipatok (`h-10`, `h-16`) dan
      // box-sizing-nya border-box, jadi tak ada yang bergeser.
      borderWidth: {
        DEFAULT: '2px',
      },
      fontFamily: {
        sans: ['Open Sans', 'system-ui', 'sans-serif'],
      },
      // Skala tipe dinaikkan ~1 langkah dari bawaan Tailwind (12/14/16/18/20).
      // Pembacanya warga padukuhan — banyak yang berumur, banyak yang di layar
      // HP — dan pada ukuran bawaan `text-sm` mendominasi seluruh aplikasi.
      // Dinaikkan di token, bukan disisir per komponen: setiap `text-sm` yang
      // sudah tertulis ikut naik, jadi tidak ada yang bisa terlewat.
      // Ukuran display (`2xl` ke atas) sengaja dibiarkan bawaan — yang kurang
      // terbaca teks isi, bukan angka besar.
      fontSize: {
        xs: ['0.8125rem', { lineHeight: '1.125rem' }], // 13px
        sm: ['0.9375rem', { lineHeight: '1.375rem' }], // 15px
        base: ['1.0625rem', { lineHeight: '1.625rem' }], // 17px
        lg: ['1.1875rem', { lineHeight: '1.75rem' }], // 19px
        xl: ['1.3125rem', { lineHeight: '1.875rem' }], // 21px
      },
    },
  },
  plugins: [],
};
