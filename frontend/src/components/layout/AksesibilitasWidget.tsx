import { useEffect, useState } from 'react';
import { Accessibility } from 'lucide-react';
import { useDismissOnOutside } from '@/hooks/use-dismiss-on-outside';
import { cn } from '@/lib/utils';

const KUNCI = 'siduk.skalaTeks';

const SKALA = [
  { label: 'A', persen: 100 },
  { label: 'A', persen: 115 },
  { label: 'A', persen: 130 },
] as const;

function terapkan(persen: number): void {
  document.documentElement.style.fontSize = `${persen}%`;
}

function skalaTersimpan(): number {
  const angka = Number(localStorage.getItem(KUNCI));
  return SKALA.some((s) => s.persen === angka) ? angka : 100;
}

/**
 * Tombol mengambang: perbesar/perkecil ukuran teks seluruh halaman.
 *
 * Murni klien — ukuran font Tailwind di proyek ini sudah `rem` (lihat
 * `tailwind.config.js`), jadi mengubah `font-size` akar dokumen ikut
 * menskalakan semuanya tanpa menyentuh satu pun kelas Tailwind.
 *
 * Disimpan `localStorage` supaya pilihannya bertahan lintas kunjungan,
 * diterapkan sekali saat komponen ini pertama mount di `PublicShell`.
 */
export function AksesibilitasWidget() {
  const [open, setOpen] = useState(false);
  const [persen, setPersen] = useState(100);

  useEffect(() => {
    const tersimpan = skalaTersimpan();
    setPersen(tersimpan);
    terapkan(tersimpan);
  }, []);

  const pilih = (nilai: number) => {
    setPersen(nilai);
    terapkan(nilai);
    localStorage.setItem(KUNCI, String(nilai));
  };

  const ref = useDismissOnOutside<HTMLDivElement>(open, () => setOpen(false));

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Pengaturan aksesibilitas"
        aria-haspopup="menu"
        aria-expanded={open}
        className="focus-ring flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg transition-colors hover:bg-brand-700"
      >
        <Accessibility className="h-6 w-6" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute bottom-14 right-0 w-52 rounded-xl border border-slate-200 bg-surface p-3 shadow-xl"
        >
          <p className="px-1 pb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Ukuran Teks
          </p>
          <div className="flex gap-2">
            {SKALA.map((s) => (
              <button
                key={s.persen}
                type="button"
                onClick={() => pilih(s.persen)}
                aria-pressed={persen === s.persen}
                className={cn(
                  'flex-1 rounded-lg border py-2 font-bold transition-colors',
                  persen === s.persen
                    ? 'border-brand-600 text-brand-600 dark:text-brand-300'
                    : 'border-slate-200 text-slate-700 hover:bg-slate-50 dark:hover:bg-white/10',
                )}
                style={{ fontSize: `${0.8 + (s.persen - 100) / 200}rem` }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
