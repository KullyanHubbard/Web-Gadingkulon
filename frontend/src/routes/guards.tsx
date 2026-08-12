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

/** Batasi akses berdasarkan role. Redirect ke beranda role bila tak sesuai. */
export function RequireRole({ role }: { role: Role }) {
  const { user } = useAuth();

  if (user?.role !== role) {
    return <Navigate to={homePathForRole(user?.role)} replace />;
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
