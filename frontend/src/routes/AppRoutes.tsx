import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { LoadingBlock } from '@/components/ui/Spinner';
import { ROLE_PENGURUS } from '@/features/auth/types';
import {
  RedirectIfAuthenticated,
  RequireAuth,
  RequireGantiPassword,
  RequireRole,
} from './guards';
import { paths } from './paths';

// Code-splitting per halaman: chart (recharts) & halaman admin hanya
// dimuat saat dibutuhkan, memperkecil bundle awal.
const LandingPage = lazy(() => import('@/pages/landing/LandingPage'));
const LoginPage = lazy(() => import('@/pages/login/LoginPetugasPage'));
const GantiPasswordPage = lazy(
  () => import('@/pages/ganti-password/GantiPasswordPage'),
);
const AdminDashboardPage = lazy(
  () => import('@/pages/admin/dashboard/AdminDashboardPage'),
);
const PendudukPage = lazy(() => import('@/pages/admin/penduduk/PendudukPage'));
const InfografisPage = lazy(
  () => import('@/pages/admin/infografis/InfografisPage'),
);
const PengurusPage = lazy(() => import('@/pages/admin/pengurus/PengurusPage'));
const RiwayatPage = lazy(() => import('@/pages/admin/riwayat/RiwayatPage'));
const NotFoundPage = lazy(() => import('@/pages/not-found/NotFoundPage'));

export function AppRoutes() {
  return (
    <Suspense fallback={<LoadingBlock />}>
      <Routes>
        <Route element={<RedirectIfAuthenticated />}>
          <Route path={paths.login} element={<LoginPage />} />
        </Route>

        <Route element={<RequireAuth />}>
          {/* Di luar `RequireGantiPassword`: inilah satu-satunya halaman yang
              harus tetap terbuka selagi password awal belum diganti. */}
          <Route path={paths.gantiPassword} element={<GantiPasswordPage />} />

          <Route element={<RequireGantiPassword />}>
            <Route element={<DashboardLayout />}>
              {/* Baca data warga: Dukuh/RW/RT. Admin ditolak backend juga. */}
              <Route element={<RequireRole roles={ROLE_PENGURUS} />}>
                <Route path={paths.admin.root} element={<AdminDashboardPage />} />
                <Route path={paths.admin.penduduk} element={<PendudukPage />} />
                <Route
                  path={paths.admin.infografis}
                  element={<InfografisPage />}
                />
              </Route>

              {/* Riwayat: dua peran, isi berbeda — backend yang memilah. */}
            <Route path={paths.admin.riwayat} element={<RiwayatPage />} />

            {/* Kelola akun: Admin saja, dan ia tidak punya halaman lain. */}
              <Route element={<RequireRole roles={['ADMIN']} />}>
                <Route path={paths.admin.pengurus} element={<PengurusPage />} />
              </Route>
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
