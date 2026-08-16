import { LogIn, UserCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { paths } from '@/routes/paths';
import { homePathForRole } from '@/routes/role-utils';

interface AccountButtonProps {
  className?: string;
}

/**
 * Pintu ke area pribadi pada landing publik: "Masuk" bagi pengunjung,
 * "Akun Saya" bagi yang sudah punya sesi.
 *
 * Dipakai di dua tempat — `PublicSidebar` (layar besar) dan `PublicTopbar`
 * (layar kecil) — satu komponen supaya gaya & tujuannya tidak bisa berbeda
 * antara keduanya.
 *
 * Labelnya sengaja bukan "Dashboard": rail kiri landing sudah punya tombol
 * bernama itu untuk panel statistik, dan dua "Dashboard" di satu layar menunjuk
 * tempat berbeda.
 */
export function AccountButton({ className }: AccountButtonProps) {
  const { isAuthenticated, user } = useAuth();
  const Icon = isAuthenticated ? UserCircle2 : LogIn;

  return (
    <Link
      to={isAuthenticated ? homePathForRole(user?.role) : paths.login}
      className={cn(
        'flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50',
        className,
      )}
    >
      <Icon className="h-4 w-4" />
      {isAuthenticated ? 'Akun Saya' : 'Masuk'}
    </Link>
  );
}
