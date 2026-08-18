/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Brand NIA — ikut warna lambang (`Logo.tsx`), #3b1368 di stop 900.
        brand: {
          50: '#f6f0fc',
          100: '#ebdff9',
          200: '#d2b6f2',
          300: '#af7ee7',
          400: '#883ddc',
          500: '#6721b5',
          600: '#531b93',
          700: '#47177d',
          800: '#411572',
          900: '#3b1368',
          950: '#220b3c',
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
