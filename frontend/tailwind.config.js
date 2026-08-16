/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
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
      },
      borderColor: ({ theme }) => ({
        DEFAULT: theme('colors.slate.200'),
      }),

      borderWidth: {
        DEFAULT: '4px',
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
