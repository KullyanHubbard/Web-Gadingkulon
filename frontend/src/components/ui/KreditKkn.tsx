import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface KreditKknProps {
  /** Padding, garis, & latar dari kerangka pemakainya — beda per kerangka. */
  className?: string;
  /** Sudut kiri bar, mis. penghitung kunjungan. Kosong di kebanyakan kerangka. */
  kiri?: ReactNode;
  /** Sudut kanan bar, mis. tombol pengaduan / ukuran teks / tema. */
  kanan?: ReactNode;
}

/**
 * Kredit pembuat, satu-satunya sumber teksnya. Dipasang di kaki keempat
 * kerangka halaman (`PublicLandingLayout`, `DashboardLayout`, `AuthLayout`,
 * `NotFoundPage`) — tidak ada satu kerangka induk yang membungkus semuanya,
 * jadi empat pemasangan itu memang lantai terendahnya.
 *
 * `sticky bottom-0`: barnya menempel ke dasar viewport selama digulir, tapi
 * tetap memakan ruang di akhir alur — jadi tidak ada isi yang tertutup dan
 * tidak perlu padding tambahan di pemakainya. Syaratnya ia harus jadi anak
 * langsung kerangka setinggi halaman, bukan dibungkus footer lain.
 *
 * Penekanan nama lewat `font-semibold`, bukan warna, supaya warnanya bisa
 * diwariskan kalau nanti dipasang di atas latar gelap (mis. panel brand
 * `AuthLayout`) tanpa menyiapkan varian.
 */
export function KreditKkn({ className, kiri, kanan }: KreditKknProps) {
  return (
    <footer
      className={cn(
        'sticky bottom-0 z-30 flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-surface py-3 px-4 text-xs font-medium text-slate-600 sm:flex-row sm:gap-3 sm:py-3',
        className,
      )}
    >
      <div className="flex w-full items-center justify-between gap-2 sm:w-auto">
        {kiri}
        <div className="flex items-center gap-2 sm:hidden">
          {kanan}
        </div>
      </div>
      <p className="text-center text-xs text-slate-500 sm:flex-1">
        Dikembangkan oleh <span className="font-bold">Tim KKNM-29228 UNY</span> ·{' '}
        {new Date().getFullYear()}
      </p>
      <div className="hidden sm:flex sm:items-center sm:gap-3">
        {kanan}
      </div>
    </footer>
  );
}
