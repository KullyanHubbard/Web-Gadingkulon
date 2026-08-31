/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand SIDUK — Ungu Profesional.
        // 600 = primary, 700 = hover, 800 = active/deep, 200 = focus ring.
        brand: {
          50:  '#F5F3FF', // purple-50
          100: '#EDE9FE', // purple-100
          200: '#DDD6FE', // purple-200  ← focus ring
          300: '#C4B5FD', // purple-300
          400: '#A78BFA', // purple-400
          500: '#8B5CF6', // purple-500
          600: '#7C3AED', // purple-600  ← primary (lebih vibrant dari 700)
          700: '#6D28D9', // purple-700  ← hover
          800: '#5B21B6', // purple-800  ← active/deep
          900: '#4C1D95', // purple-900  ← darkest
          950: '#2E1065', // purple-950
        },

        // Ramp abu-abu & warna permukaan dibaca dari CSS variable
      // (`styles/index.css`). Satu blok `:root.dark` di situ membalik seluruh
        // situs — kalau nilainya ditulis literal di sini, mode gelap berarti
        // menempelkan `dark:` di ±275 kelas yang tersebar di 98 berkas.
      //
        // `white` sengaja TIDAK ikut: `text-white` selalu duduk di atas latar
        // brand/rose yang warnanya sama di kedua mode. Latar kartu memakai
        // `bg-surface`, bukan `bg-white`.
        surface: 'rgb(var(--surface) / <alpha-value>)',
        slate: {
          50: 'rgb(var(--slate-50) / <alpha-value>)',
          100: 'rgb(var(--slate-100) / <alpha-value>)',
          200: 'rgb(var(--slate-200) / <alpha-value>)',
          300: 'rgb(var(--slate-300) / <alpha-value>)',
          400: 'rgb(var(--slate-400) / <alpha-value>)',
          500: 'rgb(var(--slate-500) / <alpha-value>)',
          600: 'rgb(var(--slate-600) / <alpha-value>)',
          700: 'rgb(var(--slate-700) / <alpha-value>)',
          800: 'rgb(var(--slate-800) / <alpha-value>)',
          900: 'rgb(var(--slate-900) / <alpha-value>)',
            950: 'rgb(var(--slate-950) / <alpha-value>)',
        },
      },
      borderColor: ({ theme }) => ({
        DEFAULT: theme('colors.slate.200'),
      }),

      borderWidth: {
        DEFAULT: '4px',
        // `border` telanjang di sini 4px (lihat DEFAULT di atas), jadi garis
        // rambut butuh kelasnya sendiri — Tailwind tidak punya `border-1`.
        1: '1px',
      },
      fontFamily: {
        sans: ['Open Sans', 'system-ui', 'sans-serif'],
      },

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
