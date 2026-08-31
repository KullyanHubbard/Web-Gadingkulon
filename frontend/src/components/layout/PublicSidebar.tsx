import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/ui/Logo';
import ikonClose from '@/assets/icons/nav/x-close.svg';
import { AccountButton } from './AccountButton';

interface PublicSidebarProps {
  /** Daftar bagian statistik. */
  nav: ReactNode;
  /** Untuk mode mobile (drawer) — lihat `Sidebar` (dashboard pengurus), pola sama. */
  open: boolean;
  onClose: () => void;
}

/**
 * Rail kiri landing page publik: logo, nav bagian, tautan masuk, footer.
 * Statis di `lg`; di bawahnya jadi drawer yang dibuka lewat `PublicTopbar`
 * (sebelumnya disembunyikan total dan nav-nya tidak bisa dijangkau sama
 * sekali di ponsel — rincian per RT cuma ada di sini).
 */
export function PublicSidebar({ nav, open, onClose }: PublicSidebarProps) {
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex h-full max-h-dvh min-h-0 w-80 flex-col border-r border-slate-200 bg-surface transition-transform lg:static lg:z-auto lg:col-start-1 lg:row-start-1 lg:h-full lg:max-h-full lg:w-auto lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* `h-20` harus sama persis dengan bar breadcrumb di `PublicLandingLayout`
            — garis bawah keduanya bersambung jadi satu baris melintang. Ubah
            satu, ubah dua-duanya. */}
        <div className="relative flex h-20 shrink-0 items-center justify-center border-b border-slate-100 px-5">
          <Logo className="h-8" />
          <button
            className="absolute right-3 rounded-md p-1 text-slate-400 hover:bg-slate-100 lg:hidden"
            onClick={onClose}
            aria-label="Tutup menu"
          >
            <span
              aria-hidden
              className="block h-5 w-5 bg-current"
              style={{
                mask: `url("${ikonClose}") center / contain no-repeat`,
                WebkitMask: `url("${ikonClose}") center / contain no-repeat`,
              }}
            />
          </button>
        </div>

        {/* `onClick` di pembungkus hanya memanggil `onClose` saat elemen tombol/tautan
            diklik, sehingga melepaskan sentuhan/scroll di area kosong tidak menutup drawer. */}
        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3 [webkit-overflow-scrolling:touch]"
          onClick={(e) => {
            if ((e.target as HTMLElement).closest('button, a')) {
              onClose();
            }
          }}
        >
          {nav}
          <AccountButton className="mt-4 w-full justify-center" />
        </div>

        <p className="shrink-0 border-t border-slate-100 p-4 text-sm text-slate-400">
          Portal Data Kependudukan Padukuhan
        </p>
      </aside>
    </>
  );
}
