import { useEffect, useRef, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { KreditKkn } from '@/components/ui/KreditKkn';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';

/**
 * Kerangka halaman ter-autentikasi: sidebar + navbar + area konten.
 *
 * Mulai `lg` tingginya dikunci ke viewport dan cuma `main` yang menggulung.
 * Dengan seluruh halaman yang menggulung, navbar, kaki sidebar, dan kredit
 * pembuat ikut terdorong ke dasar dokumen — tidak pernah kelihatan di halaman
 * panjang (daftar penduduk, infografis).
 *
 * Di bawah `lg` sengaja dibiarkan menggulung normal: sidebar sudah jadi drawer,
 * dan mengunci tinggi di ponsel berarti bilah kredit memakan tinggi layar
 * permanen plus bilah URL peramban tidak pernah menyingkir.
 */
export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const konten = useRef<HTMLElement>(null);

  // Yang menggulung `main`, bukan window, dan elemennya bertahan lintas rute —
  // tanpa ini pindah dari daftar penduduk yang sudah digulung mendarat di
  // tengah halaman berikutnya. Pemulih gulung bawaan router cuma tahu window.
  useEffect(() => {
    konten.current?.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-screen bg-slate-50 lg:h-dvh lg:min-h-0 lg:overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar onOpenSidebar={() => setSidebarOpen(true)} />

        {/* Wadah gulung selebar kolom; lebar-maksimum konten ada di dalamnya
            supaya batang gulungnya di tepi layar, bukan di tepi `max-w-6xl`. */}
        <main ref={konten} className="flex-1 lg:overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 lg:px-8">
            <Outlet />
          </div>
        </main>

        <KreditKkn className="shrink-0 border-t border-slate-200 px-4 py-4 lg:px-8" />
      </div>
    </div>
  );
}
