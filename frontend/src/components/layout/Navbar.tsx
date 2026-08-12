import { useEffect, useRef, useState } from 'react';
import { LogOut, Menu, UserCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { useAuth, useLogout } from '@/features/auth/hooks/use-auth';

export function Navbar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const { user, isAdmin } = useAuth();
  const logout = useLogout();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Tutup dropdown saat klik di luar area menu atau tekan Escape.
  useEffect(() => {
    if (!menuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

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
          <p className="text-sm font-medium text-slate-800">{user?.nama}</p>
          <p className="text-xs text-slate-500">
            {isAdmin ? (user?.jabatan ?? 'Perangkat Desa') : 'Warga'}
          </p>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
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
                <p className="text-sm font-medium text-slate-800">
                  {user?.nama}
                </p>
                <Badge tone={isAdmin ? 'brand' : 'green'} className="mt-1">
                  {isAdmin ? 'Admin' : 'Warga'}
                </Badge>
              </div>
              <button
                onClick={logout}
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
