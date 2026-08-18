import type { ReactNode } from 'react';
import { AccountButton } from './AccountButton';
import { Logo } from './Logo';

interface PublicSidebarProps {
  /** Daftar bagian statistik. */
  nav: ReactNode;
}

/**
 * Rail kiri landing page publik: logo, nav bagian, tautan masuk, footer.
 * Disembunyikan di layar kecil — gantinya `PublicTopbar`.
 */
export function PublicSidebar({ nav }: PublicSidebarProps) {
  return (
    <aside className="hidden flex-col border-r border-slate-200 bg-white lg:col-start-1 lg:row-start-1 lg:flex">
      {/* `h-20` harus sama persis dengan bar breadcrumb di `PublicLandingLayout`
          — garis bawah keduanya bersambung jadi satu baris melintang. Ubah
          satu, ubah dua-duanya. */}
      <div className="flex h-20 shrink-0 items-center justify-center border-b border-slate-100 px-5">
        <Logo className="h-8" />
      </div>

      <div className="min-h-0 overflow-y-auto p-3">
        {nav}
        <AccountButton className="mt-4 w-full justify-center" />
      </div>

      <div className="flex-1" />

      <p className="shrink-0 border-t border-slate-100 p-4 text-sm text-slate-400">
        Portal Data Kependudukan Padukuhan
      </p>
    </aside>
  );
}
