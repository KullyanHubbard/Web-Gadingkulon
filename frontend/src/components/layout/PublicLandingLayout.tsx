import type { ReactNode } from 'react';
import { Building2, LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { env } from '@/config/env';
import { paths } from '@/routes/paths';

interface PublicLandingLayoutProps {
  /** Rail kiri: daftar bagian statistik. Disembunyikan di layar kecil. */
  nav: ReactNode;
  /** Kolom kanan: panel statistik. */
  children: ReactNode;
}

const tautanMasukClassName =
  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900';

/**
 * Kerangka landing page publik: rail bagian + panel statistik. Jalur masuk
 * bukan bagian dari halaman ini lagi — hanya tautan "Masuk" menuju
 * `pages/login/LoginPage.tsx`, hidup di rail (layar besar) dan bilah atas
 * (layar kecil, di mana rail disembunyikan).
 */
export function PublicLandingLayout({
  nav,
  children,
}: PublicLandingLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="hidden flex-col border-r border-slate-200 bg-white lg:col-start-1 lg:row-start-1 lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-slate-100 px-5 font-semibold text-slate-900">
          <Building2 className="h-6 w-6 text-brand-600" />
          {env.appName}
        </div>

        <div className="flex-1 overflow-y-auto p-3">{nav}</div>

        <div className="border-t border-slate-100 p-3">
          <Link to={paths.login} className={tautanMasukClassName}>
            <LogIn className="h-5 w-5" />
            Masuk
          </Link>
        </div>

        <p className="border-t border-slate-100 p-4 text-xs text-slate-400">
          Portal Data Kependudukan Padukuhan
        </p>
      </aside>

      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 lg:hidden">
        <div className="flex items-center gap-2 font-semibold text-slate-900">
          <Building2 className="h-6 w-6 text-brand-600" />
          {env.appName}
        </div>
        <Link
          to={paths.login}
          className="flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          <LogIn className="h-4 w-4" />
          Masuk
        </Link>
      </div>

      <main className="flex flex-1 flex-col justify-center px-6 py-10 lg:col-start-2 lg:row-start-1 lg:px-12">
        {children}
      </main>
    </div>
  );
}
