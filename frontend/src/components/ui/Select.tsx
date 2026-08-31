import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  /**
   * Peta `nilai -> teks` yang dijadikan `<option>`. Bentuk ini yang dipakai
   * seluruh enum domain di `labels.ts`, jadi pemanggil tidak perlu memetakan
   * ulang. Untuk pilihan yang bukan enum, oper `children` sendiri.
   */
  pilihan?: Record<string, string>;
}

/** Padanan `Input` untuk `<select>`: label, pesan galat, dan gaya yang sama. */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, pilihan, id, children, ...props }, ref) => {
    const selectId = id ?? props.name;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            // `border-1`, bukan `border`: `borderWidth.DEFAULT` di
            // tailwind.config di-setel 4px.
            'focus-ring h-10 w-full rounded-lg border-1 border-slate-300 bg-surface px-3 text-sm text-slate-900 transition-colors focus:border-brand-600 disabled:bg-slate-100 disabled:text-slate-500',
            error && 'border-red-400 focus:border-red-500',
            className,
          )}
          aria-invalid={Boolean(error)}
          {...props}
        >
          {pilihan
            ? Object.entries(pilihan).map(([nilai, teks]) => (
                <option key={nilai} value={nilai} className="bg-surface text-slate-900">
                  {teks}
                </option>
              ))
            : children}
        </select>
        {error ? (
          <p className="mt-1 text-xs text-red-600">{error}</p>
        ) : hint ? (
          <p className="mt-1 text-xs text-slate-500">{hint}</p>
        ) : null}
      </div>
    );
  },
);
Select.displayName = 'Select';
