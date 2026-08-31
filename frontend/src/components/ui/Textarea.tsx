import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

/** Padanan `Input` untuk teks panjang. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const textareaId = id ?? props.name;
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'focus-ring w-full rounded-lg border-1 border-slate-300 bg-surface px-3 py-2 text-sm text-slate-900 transition-colors placeholder:text-slate-400 focus:border-brand-600',
            error && 'border-red-400 focus:border-red-500',
            className,
          )}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {error ? (
          <p className="mt-1 text-xs text-red-600">{error}</p>
        ) : hint ? (
          <p className="mt-1 text-xs text-slate-500">{hint}</p>
        ) : null}
      </div>
    );
  },
);
Textarea.displayName = 'Textarea';
