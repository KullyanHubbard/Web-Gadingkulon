import { Building2 } from 'lucide-react';
import { env } from '@/config/env';
import { AccountButton } from './AccountButton';

/**
 * Bilah atas landing page publik untuk layar kecil — gantinya `PublicSidebar`
 * yang disembunyikan di bawah breakpoint `lg`.
 */
export function PublicTopbar() {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 lg:hidden">
      <div className="flex items-center gap-2 font-semibold text-slate-900">
        <Building2 className="h-6 w-6 text-brand-600" />
        {env.appName}
      </div>
      <AccountButton />
    </div>
  );
}
