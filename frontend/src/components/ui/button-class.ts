import { cn } from '@/lib/utils';

export type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type Size = 'sm' | 'md' | 'lg';

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 shadow-sm',
  secondary:
    'bg-slate-100 text-slate-900 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
  outline:
    'border border-slate-300 bg-surface text-slate-700 hover:bg-slate-50 dark:hover:bg-white/10 dark:hover:text-white',
  ghost:
    'text-slate-600 hover:bg-slate-100 dark:hover:bg-white/10 dark:hover:text-white',
  danger: 'bg-red-600 text-white hover:bg-red-700',
};

const sizeStyles: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

/**
 * Gaya tombol tanpa elemennya. Dipakai `Button` dan `<Link>` yang harus tampil
 * sebagai tombol (CTA halaman publik).
 *
 * Dipisah dari `Button.tsx`, bukan lewat `asChild`: pola itu butuh
 * `@radix-ui/react-slot`, satu dependensi baru untuk sesuatu yang di sini cuma
 * soal daftar class. Berkasnya sendiri terpisah karena `Button.tsx` hanya boleh
 * mengekspor komponen (aturan `react-refresh/only-export-components`).
 */
export function buttonClass({
  variant = 'primary',
  size = 'md',
  className,
}: {
  variant?: Variant;
  size?: Size;
  className?: string;
} = {}): string {
  return cn(
    'focus-ring inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-60',
    variantStyles[variant],
    sizeStyles[size],
    className,
  );
}
