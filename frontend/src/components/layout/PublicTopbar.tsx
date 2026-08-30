import { Logo } from '@/components/ui/Logo';
import ikonMenu from '@/assets/icons/nav/menu.svg';
import { AccountButton } from './AccountButton';

/**
 * Bilah atas landing page publik untuk layar kecil — gantinya `PublicSidebar`
 * yang jadi drawer di bawah breakpoint `lg`. Tombol menu membuka drawer itu;
 * tanpanya nav bagian statistik (termasuk rincian per RT) tidak terjangkau
 * sama sekali di ponsel.
 */
export function PublicTopbar({ onOpenNav }: { onOpenNav: () => void }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4 lg:hidden">
      <div className="flex items-center gap-2">
        <button
          className="-ml-1 rounded-md p-2 text-slate-500 hover:bg-slate-100"
          onClick={onOpenNav}
          aria-label="Buka menu"
        >
          <span
            aria-hidden
            className="block h-5 w-5 bg-current"
            style={{
              mask: `url("${ikonMenu}") center / contain no-repeat`,
              WebkitMask: `url("${ikonMenu}") center / contain no-repeat`,
            }}
          />
        </button>
        <Logo />
      </div>
      <AccountButton />
    </div>
  );
}
