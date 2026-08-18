import { AccountButton } from './AccountButton';
import { Logo } from './Logo';

/**
 * Bilah atas landing page publik untuk layar kecil — gantinya `PublicSidebar`
 * yang disembunyikan di bawah breakpoint `lg`.
 */
export function PublicTopbar() {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 lg:hidden">
      <Logo />
      <AccountButton />
    </div>
  );
}
