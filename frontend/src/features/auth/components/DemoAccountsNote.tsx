import type { ReactNode } from 'react';
import { ShieldCheck } from 'lucide-react';

/**
 * Catatan akun demo di bawah form masuk — hanya tampil di mode mock.
 *
 * Presentasi murni: keputusan *apakah* catatan ini muncul ada di container,
 * bukan di sini.
 */
export function DemoAccountsNote({ items }: { items: ReactNode[] }) {
  return (
    <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
      <div className="mb-1.5 flex items-center gap-1.5 font-medium text-slate-700">
        <ShieldCheck className="h-3.5 w-3.5" />
        Akun demo (mode mock)
      </div>
      <ul className="space-y-0.5">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
