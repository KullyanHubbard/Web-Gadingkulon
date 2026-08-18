import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { warnaLembut } from '@/lib/colors';
import { env } from '@/config/env';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { Logo } from './Logo';
import { navItemsForRole } from './nav-config';

interface SidebarProps {
  /** Untuk mode mobile (drawer). */
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { user } = useAuth();
  const items = navItemsForRole(user?.role);

  return (
    <>
      {/* Overlay mobile */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Tombol tutup `absolute`, bukan sesama flex item: dengan
            `justify-between` lambangnya ikut bergeser saat tombol muncul —
            posisinya jadi beda antara ponsel dan desktop. */}
        <div className="relative flex h-16 shrink-0 items-center justify-center border-b border-slate-100 px-5">
          <Logo />
          <button
            className="absolute right-3 rounded-md p-1 text-slate-400 hover:bg-slate-100 lg:hidden"
            onClick={onClose}
            aria-label="Tutup menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto p-3">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'text-slate-900'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
                )
              }
              // Latar aktif memakai warna halaman itu sendiri, bukan satu biru
              // untuk semua. Teksnya tetap `slate-900`: warna aksennya cuma
              // 3,2-5,8:1 di atas putih — cukup untuk ikon, di bawah 4,5:1 yang
              // dituntut teks seukuran ini.
              style={({ isActive }) =>
                isActive
                  ? { backgroundColor: warnaLembut(item.aksen) }
                  : undefined
              }
            >
              {/* Ikon SVG dipasang sebagai mask, bukan `<img>`: berkasnya satu
                  warna, jadi `backgroundColor` di bawah yang menentukan
                  warnanya — itu yang membuat tiap menu bisa punya aksen
                  sendiri tanpa menyiapkan satu berkas SVG per warna.
                  URL wajib dipetik ganda — tanpa itu mask diabaikan diam-diam
                  dan yang tampil kotak penuh. */}
              {item.icon && (
                <span
                  className="h-5 w-5 shrink-0"
                  style={{
                    backgroundColor: item.aksen,
                    mask: `url("${item.icon}") center / contain no-repeat`,
                    WebkitMask: `url("${item.icon}") center / contain no-repeat`,
                  }}
                />
              )}
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="shrink-0 border-t border-slate-100 p-4 text-xs text-slate-400">
          {env.appName} · v0.1.0
        </div>
      </aside>
    </>
  );
}
