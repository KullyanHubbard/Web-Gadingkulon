import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks/use-auth';
import type { Role } from '@/features/auth/types';
import { paths } from './paths';
import { homePathForRole } from './role-utils';

/** Wajib login. Simpan lokasi asal agar bisa kembali setelah login. */
export function RequireAuth() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to={paths.login} state={{ from: location }} replace />;
  }
  return <Outlet />;
}

/**
 * Batasi akses ke daftar role tertentu. Redirect ke halaman awal role-nya bila
 * tidak sesuai.
 *
 * Menerima daftar, bukan satu role: sejak ada empat peran, "boleh baca data
 * warga" berarti tiga role sekaligus (Dukuh/RW/RT), dan menuliskannya sebagai
 * tiga guard bersarang cuma menyembunyikan aturan yang sama.
 */
export function RequireRole({ roles }: { roles: readonly Role[] }) {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return <Navigate to={homePathForRole(user?.role)} replace />;
  }
  return <Outlet />;
}

/**
 * Password awal dari Admin belum diganti: seluruh aplikasi dialihkan ke halaman
 * ganti password. Kenyamanan saja — backend menolak akun ini di semua endpoint
 * lain, jadi tanpa pengalihan pun tidak ada yang bisa dibuka.
 */
export function RequireGantiPassword() {
  const { harusGantiPassword } = useAuth();

  if (harusGantiPassword) {
    return <Navigate to={paths.gantiPassword} replace />;
  }
  return <Outlet />;
}

/** Untuk halaman publik (login): kalau sudah login, lempar ke beranda. */
export function RedirectIfAuthenticated() {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={homePathForRole(user?.role)} replace />;
  }
  return <Outlet />;
}
