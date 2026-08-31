import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  /** Ikon di dalam sisi kiri kolom — penanda, bukan kontrol. */
  icon?: ReactNode;
  /** Kontrol di dalam sisi kanan kolom, mis. tombol lihat/sembunyikan PIN. */
  trailing?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, icon, trailing, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            {label}
          </label>
        )}
        {/* Relatif hanya bila ada isian di dalamnya — kolom polos tidak perlu
            konteks posisi. */}
        <div className={cn((icon || trailing) && 'relative')}>
          {icon && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-y-0 left-0 flex w-10 items-center justify-center text-slate-400"
            >
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              // `border-1`, bukan `border`: `borderWidth.DEFAULT` di
              // tailwind.config di-setel 4px.
              'focus-ring h-10 w-full rounded-lg border-1 border-slate-300 bg-surface px-3 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:border-brand-600 focus-visible:ring-brand-600/20',
              icon && 'pl-10',
              trailing && 'pr-11',
              error &&
                'border-red-400 focus:border-red-500 focus-visible:ring-red-500',
              className,
            )}
            aria-invalid={Boolean(error)}
            {...props}
          />
          {trailing && (
            <span className="absolute inset-y-0 right-0 flex w-11 items-center justify-center">
              {trailing}
            </span>
          )}
        </div>
        {error ? (
          <p className="mt-1 text-xs text-red-600">{error}</p>
        ) : hint ? (
          <p className="mt-1 text-xs text-slate-500">{hint}</p>
        ) : null}
      </div>
    );
  },
);
Input.displayName = 'Input';
