import { LayoutDashboard } from 'lucide-react';

/**
 * Daftar bagian statistik di rail kiri halaman masuk.
 *
 * Tanpa state: baru ada satu bagian yang bisa ditampilkan, jadi `Dashboard`
 * ditandai aktif dan tidak ke mana-mana. Section `Statistik Warga` sudah
 * disiapkan tetapi isinya menyusul — begitu ada bagian kedua, komponen ini yang
 * berubah jadi daftar tab, bukan halamannya.
 */
export function StatistikNav() {
  return (
    <nav aria-label="Bagian statistik" className="space-y-7">
      <span
        aria-current="page"
        className="flex items-center gap-3 rounded-lg bg-brand-50 px-3 py-2 text-sm font-medium text-brand-700"
      >
        <LayoutDashboard className="h-5 w-5" />
        Dashboard
      </span>

      <div>
        <p className="px-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Statistik Warga
        </p>
        <p className="mt-2 rounded-lg border border-dashed border-slate-200 px-3 py-3 text-xs leading-relaxed text-slate-400">
          Rincian per RW menyusul.
        </p>
      </div>
    </nav>
  );
}
