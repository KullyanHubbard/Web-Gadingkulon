import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LoadingBlock } from '@/components/ui/Spinner';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { RedirectIfAuthenticated, RequireAuth, RequireRole } from './guards';
import { homePathForRole } from './role-utils';
import { paths } from './paths';

// Code-splitting per halaman: chart (recharts) & halaman admin hanya
// dimuat saat dibutuhkan, memperkecil bundle awal.
const LoginPage = lazy(() => import('@/pages/login/LoginPage'));
const LoginPetugasPage = lazy(() => import('@/pages/login/LoginPetugasPage'));
const AktivasiPage = lazy(() => import('@/pages/aktivasi/AktivasiPage'));
const BerandaPage = lazy(() => import('@/pages/user/beranda/BerandaPage'));
const KontakPage = lazy(() => import('@/pages/user/kontak/KontakPage'));
const AdminDashboardPage = lazy(
  () => import('@/pages/admin/dashboard/AdminDashboardPage'),
);
const PendudukPage = lazy(() => import('@/pages/admin/penduduk/PendudukPage'));
const InfografisPage = lazy(
  () => import('@/pages/admin/infografis/InfografisPage'),
);
const NotFoundPage = lazy(() => import('@/pages/not-found/NotFoundPage'));

/** Redirect root "/" ke beranda sesuai status & role. */
function RootRedirect() {
  const { isAuthenticated, user } = useAuth();
  return (
    <Navigate
      to={isAuthenticated ? homePathForRole(user?.role) : paths.login}
      replace
    />
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <Routes>
        {/* Publik */}
        <Route element={<RedirectIfAuthenticated />}>
          <Route path={paths.login} element={<LoginPage />} />
          <Route path={paths.loginPetugas} element={<LoginPetugasPage />} />
          <Route path={paths.aktivasi} element={<AktivasiPage />} />
        </Route>

        {/* Ter-autentikasi */}
        <Route element={<RequireAuth />}>
          <Route element={<DashboardLayout />}>
            {/* Semua role: data pribadi */}
            <Route path={paths.beranda} element={<BerandaPage />} />

            {/* Khusus warga: kontak opsional miliknya sendiri */}
            <Route element={<RequireRole role="USER" />}>
              <Route path={paths.kontak} element={<KontakPage />} />
            </Route>

            {/* Khusus admin (pengurus padukuhan) */}
            <Route element={<RequireRole role="ADMIN" />}>
              <Route path={paths.admin.root} element={<AdminDashboardPage />} />
              <Route path={paths.admin.penduduk} element={<PendudukPage />} />
              <Route
                path={paths.admin.infografis}
                element={<InfografisPage />}
              />
            </Route>
          </Route>
        </Route>

        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
