import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/utils';
import { paths } from '@/routes/paths';
import { AccountButton } from './AccountButton';

/**
 * Tautan publik. `end` wajib untuk `/` — tanpa itu beranda cocok sebagai
 * prefix setiap route dan menunya menyala di semua halaman. Untuk `/berita`
 * justru sebaliknya: prefix-nya harus cocok agar `/berita/:slug` ikut menyala.
 */
const TAUTAN = [
  { label: 'Beranda', to: paths.landing, end: true },
  { label: 'Profil Desa', to: paths.profil, end: true },
  { label: 'Infografis', to: paths.infografis, end: true },
  { label: 'Berita', to: paths.berita, end: false },
  { label: 'Statistik', to: paths.statistik, end: true },
];

const tautanClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'rounded-lg px-3.5 py-2 text-sm transition-colors',
    isActive
      ? 'font-bold text-brand-600 dark:text-brand-300'
      : 'font-medium text-slate-600 hover:bg-slate-100 dark:hover:bg-white/10 dark:hover:text-white hover:text-slate-900',
  );

/**
 * Bilah navigasi halaman publik: beranda, profil, infografis, berita,
 * statistik, plus pintu masuk pengurus.
 *
 * `sticky`, bukan `fixed`: halaman publik panjang dan navigasinya harus selalu
 * terjangkau, tapi `fixed` mengharuskan tiap halaman menyisakan padding atas
 * sendiri-sendiri — satu yang lupa langsung tertutup bilahnya.
 */
export function PublicNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-surface/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <NavLink to={paths.landing} aria-label="Beranda" className="shrink-0">
          <Logo className="h-8" />
        </NavLink>

        <nav className="ml-auto hidden items-center gap-1 lg:flex">
          {TAUTAN.map((t) => (
            <NavLink key={t.to} to={t.to} end={t.end} className={tautanClass}>
              {t.label}
            </NavLink>
          ))}
        </nav>

        <AccountButton className="ml-auto hidden lg:ml-4 lg:flex" />

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="ml-auto rounded-md p-2 text-slate-600 hover:bg-slate-100 dark:hover:bg-white/10 lg:hidden"
          aria-label={open ? 'Tutup menu' : 'Buka menu'}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        // Menutup sendiri saat sebuah tautan diklik: tanpa itu panelnya tetap
        // menutupi halaman tujuan setelah navigasi.
        <nav
          className="flex flex-col gap-1 border-t border-slate-200 px-4 py-3 lg:hidden"
          onClick={() => setOpen(false)}
        >
          {TAUTAN.map((t) => (
            <NavLink key={t.to} to={t.to} end={t.end} className={tautanClass}>
              {t.label}
            </NavLink>
          ))}
          <AccountButton className="mt-2 justify-center" />
        </nav>
      )}
    </header>
  );
}
