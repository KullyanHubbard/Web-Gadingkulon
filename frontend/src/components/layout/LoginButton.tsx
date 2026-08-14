import { LogIn } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { paths } from '@/routes/paths';

interface LoginButtonProps {
  className?: string;
}

/**
 * Tautan "Masuk" bergaya tombol, menuju halaman masuk warga.
 *
 * Dipakai di dua tempat pada landing page publik: `PublicSidebar` (layar
 * besar) dan `PublicTopbar` (layar kecil) — satu komponen supaya gaya &
 * tujuannya tidak bisa berbeda antara keduanya.
 */
export function LoginButton({ className }: LoginButtonProps) {
  return (
    <Link
      to={paths.login}
      className={cn(
        'flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50',
        className,
      )}
    >
      <LogIn className="h-4 w-4" />
      Masuk
    </Link>
  );
}
