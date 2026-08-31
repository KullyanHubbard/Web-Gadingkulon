import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PublicShell } from '@/components/layout/PublicShell';
import { LoadingBlock } from '@/components/ui/Spinner';
import { ROLE_PENGURUS } from '@/features/auth/types';
import {
  RedirectIfAuthenticated,
  RequireAuth,
  RequireGantiPassword,
  RequireRole,
} from './guards';
import { paths } from './paths';

// Code-splitting per halaman: halaman admin & portal publik hanya dimuat saat
// dibutuhkan, memperkecil bundle awal.
const HomePage = lazy(() => import('@/pages/publik/home/HomePage'));
const ProfilPage = lazy(() => import('@/pages/publik/profil/ProfilPage'));
const InfografisPublikPage = lazy(
  () => import('@/pages/publik/infografis/InfografisPublikPage'),
);
const BeritaListPage = lazy(
  () => import('@/pages/publik/berita/BeritaListPage'),
);
const BeritaDetailPage = lazy(
  () => import('@/pages/publik/berita/BeritaDetailPage'),
);
const StatistikPage = lazy(() => import('@/pages/statistik/StatistikPage'));
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
const KelolaBeritaPage = lazy(
  () => import('@/pages/admin/berita/KelolaBeritaPage'),
);
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
                <Route
                  path={paths.admin.root}
                  element={<AdminDashboardPage />}
                />
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

              {/* Isi portal publik — bukan data warga, bukan akun. Dukuh saja:
                  Admin sengaja tidak punya kewenangan atas isi situs. */}
              <Route element={<RequireRole roles={['DUKUH']} />}>
                <Route
                  path={paths.admin.berita}
                  element={<KelolaBeritaPage />}
                />
              </Route>
            </Route>
          </Route>
        </Route>

        {/* Halaman publik, terbuka untuk semua — termasuk yang sudah masuk.
            Semua berbagi satu `PublicShell` (navbar + footer) kecuali
            `/statistik`, yang kerangkanya rail kiri dan tingginya dikunci ke
            viewport — dua kerangka itu tidak bisa ditumpuk. */}
        <Route element={<PublicShell />}>
          <Route path={paths.landing} element={<HomePage />} />
          <Route path={paths.profil} element={<ProfilPage />} />
          <Route path={paths.infografis} element={<InfografisPublikPage />} />
          <Route path={paths.berita} element={<BeritaListPage />} />
          <Route path="/berita/:slug" element={<BeritaDetailPage />} />
        </Route>
        <Route path={paths.statistik} element={<StatistikPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
