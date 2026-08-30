import { cn } from '@/lib/utils';

interface KreditKknProps {
  /** Padding, garis, & latar dari kerangka pemakainya — beda per kerangka. */
  className?: string;
}

/**
 * Kredit pembuat, satu-satunya sumber teksnya. Dipasang di kaki keempat
 * kerangka halaman (`PublicLandingLayout`, `DashboardLayout`, `AuthLayout`,
 * `NotFoundPage`) — tidak ada satu kerangka induk yang membungkus semuanya,
 * jadi empat pemasangan itu memang lantai terendahnya.
 *
 * Penekanan nama lewat `font-semibold`, bukan warna, supaya warnanya bisa
 * diwariskan kalau nanti dipasang di atas latar gelap (mis. panel brand
 * `AuthLayout`) tanpa menyiapkan varian.
 */
export function KreditKkn({ className }: KreditKknProps) {
  return (
    <footer
      className={cn(
        'text-center text-xs font-medium text-slate-600',
        className,
      )}
    >
      Dikembangkan oleh <span className="font-bold">Tim KKNM-29228 UNY</span> ·{' '}
      {new Date().getFullYear()}
    </footer>
  );
}
