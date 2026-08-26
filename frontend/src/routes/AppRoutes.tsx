import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LoadingBlock } from '@/components/ui/Spinner';
import { RedirectIfAuthenticated, RequireAuth, RequireRole } from './guards';
import { paths } from './paths';

// Code-splitting per halaman: chart (recharts) & halaman admin hanya
// dimuat saat dibutuhkan, memperkecil bundle awal.
const LandingPage = lazy(() => import('@/pages/landing/LandingPage'));
const LoginPage = lazy(() => import('@/pages/login/LoginPetugasPage'));
const AdminDashboardPage = lazy(
  () => import('@/pages/admin/dashboard/AdminDashboardPage'),
);
const PendudukPage = lazy(() => import('@/pages/admin/penduduk/PendudukPage'));
const InfografisPage = lazy(
  () => import('@/pages/admin/infografis/InfografisPage'),
);
const PengurusPage = lazy(() => import('@/pages/admin/pengurus/PengurusPage'));
const NotFoundPage = lazy(() => import('@/pages/not-found/NotFoundPage'));

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <Routes>
        <Route element={<RedirectIfAuthenticated />}>
          <Route path={paths.login} element={<LoginPage />} />
        </Route>

        <Route element={<RequireAuth />}>
          <Route element={<DashboardLayout />}>
            {/* Semua pengurus: baca data & statistik, tidak dibatasi wilayah. */}
            <Route path={paths.admin.root} element={<AdminDashboardPage />} />
            <Route path={paths.admin.penduduk} element={<PendudukPage />} />
            <Route path={paths.admin.infografis} element={<InfografisPage />} />

            {/* Kelola akun adalah kewenangan terpisah, ADMIN saja. */}
            <Route element={<RequireRole role="ADMIN" />}>
              <Route path={paths.admin.pengurus} element={<PengurusPage />} />
            </Route>
          </Route>
        </Route>

        {/* Landing publik, terbuka untuk semua — termasuk yang sudah masuk. */}
        <Route path={paths.landing} element={<LandingPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
