import { Outlet } from 'react-router-dom';
import { KreditKkn } from '@/components/ui/KreditKkn';
import { PADUKUHAN } from '@/lib/padukuhan';
import { PublicNavbar } from './PublicNavbar';

/**
 * Kerangka semua halaman publik ber-navbar: beranda, profil, infografis,
 * berita. Dipasang sebagai layout route, jadi navbar tidak ikut di-mount ulang
 * saat berpindah halaman.
 *
 * Halaman `/statistik` TIDAK memakai ini — kerangkanya rail kiri
 * (`PublicLandingLayout`) yang tingginya dikunci ke viewport, dan dua kerangka
 * itu tidak bisa ditumpuk tanpa merusak penggulungannya.
 */
export function PublicShell() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      {/* `<div>`, bukan `<footer>` kedua: `KreditKkn` sudah mencetak
          `<footer>` sendiri, dan footer bersarang bukan HTML yang sah. */}
      <div className="border-t border-slate-200 bg-white">
        <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold text-slate-900">
            {PADUKUHAN.namaLengkap}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {PADUKUHAN.desa}, {PADUKUHAN.kapanewon}, {PADUKUHAN.kabupaten},{' '}
            {PADUKUHAN.provinsi}
          </p>
        </div>
        <KreditKkn className="border-t border-slate-100 px-4 py-4 sm:px-6 lg:px-8" />
      </div>
    </div>
  );
}
