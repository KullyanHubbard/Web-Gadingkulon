import type { ReactNode } from 'react';
import { Building2 } from 'lucide-react';
import { env } from '@/config/env';
import { LoginButton } from './LoginButton';

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
      <div className="flex h-16 items-center gap-2 border-b border-slate-100 px-5 font-semibold text-slate-900">
        <Building2 className="h-6 w-6 text-brand-600" />
        {env.appName}
      </div>

      <div className="overflow-y-auto p-3">
        {nav}
        <LoginButton className="mt-4 w-full justify-center" />
      </div>

      <div className="flex-1" />

      <p className="border-t border-slate-100 p-4 text-xs text-slate-400">
        Portal Data Kependudukan Padukuhan
      </p>
    </aside>
  );
}
