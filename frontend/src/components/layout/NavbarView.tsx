import type { RefObject } from 'react';
import { LogOut, Menu, UserCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface NavbarViewProps {
  nama: string;
  /** Teks jabatan di bawah nama, mis. "Ketua RT 03" atau "Dukuh". */
  peran: string;
  /** Label ringkas pada badge di dalam dropdown. */
  peranBadge: string;
  peranBadgeTone: 'brand' | 'green';
  onOpenSidebar: () => void;
  menuOpen: boolean;
  onToggleMenu: () => void;
  menuRef: RefObject<HTMLDivElement>;
  onLogout: () => void;
}

/** Bilah atas: tombol sidebar (mobile) + menu pengguna. Tampilan saja. */
export function NavbarView({
  nama,
  peran,
  peranBadge,
  peranBadgeTone,
  onOpenSidebar,
  menuOpen,
  onToggleMenu,
  menuRef,
  onLogout,
}: NavbarViewProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 backdrop-blur lg:px-6">
      <button
        className="rounded-md p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
        onClick={onOpenSidebar}
        aria-label="Buka menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-slate-800">{nama}</p>
          <p className="text-xs text-slate-500">{peran}</p>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={onToggleMenu}
            className="focus-ring flex items-center gap-2 rounded-full"
            aria-label="Menu pengguna"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <UserCircle2 className="h-9 w-9 text-slate-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-200 bg-white p-1.5 shadow-lg">
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-slate-800">{nama}</p>
                <Badge tone={peranBadgeTone} className="mt-1">
                  {peranBadge}
                </Badge>
              </div>
              <button
                onClick={onLogout}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
