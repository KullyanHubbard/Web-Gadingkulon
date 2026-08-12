import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Penjaga palet tertutup (lihat CLAUDE.md §6 "Warna").
      // `theme.colors` di tailwind.config.js sudah mematikan warna di luar palet,
      // tapi tidak bisa mencegah hex mentah & arbitrary value — itu tugas rule ini.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'Literal[value=/#[0-9a-fA-F]{3}([0-9a-fA-F]{3})?\\b/]',
          message:
            'Dilarang hex warna di komponen. Pakai token Tailwind (brand-*/slate-*/…); untuk Recharts pakai @/lib/colors.',
        },
        {
          selector:
            'Literal[value=/\\b(bg|text|border|ring|fill|stroke|from|to|via|divide|outline|shadow|accent)-\\[/]',
          message:
            'Dilarang arbitrary value warna Tailwind (mis. bg-[#…]). Tambahkan warnanya di tailwind.config.js kalau memang perlu.',
        },
      ],
    },
  },
);
