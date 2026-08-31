import { Mail, Phone } from 'lucide-react';
import { Link, Outlet } from 'react-router-dom';
import { PADUKUHAN } from '@/lib/padukuhan';
import { paths } from '@/routes/paths';
import { BarKredit } from './BarKredit';
import { PublicNavbar } from './PublicNavbar';

const JELAJAHI = [
  { label: 'Beranda', to: paths.landing },
  { label: 'Profil Desa', to: paths.profil },
  { label: 'Infografis', to: paths.infografis },
  { label: 'Berita', to: paths.berita },
  { label: 'Statistik Warga', to: paths.statistik },
];

/**
 * Kerangka semua halaman publik ber-navbar: beranda, profil, infografis,
 * berita. Dipasang sebagai layout route, jadi navbar & footer tidak ikut
 * di-mount ulang saat berpindah halaman — termasuk widget mengambangnya, yang
 * kalau tidak begitu akan memicu ulang hitungan kunjungan tiap navigasi.
 *
 * Halaman `/statistik` TIDAK memakai ini — kerangkanya rail kiri
 * (`PublicLandingLayout`) yang tingginya dikunci ke viewport, dan dua kerangka
 * itu tidak bisa ditumpuk tanpa merusak penggulungannya. Penghitung kunjungan &
 * tombol pengaduan/ukuran teks/tema tetap ada di sana, dipasang lewat slot bar
 * kredit yang sama.
 */
export function PublicShell() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <PublicNavbar />
      <main className="flex-1">
        <Outlet />
      </main>

      <div className="bg-brand-950 text-brand-100">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-3 lg:px-8">
          <div>
            <p className="text-lg font-bold text-white">
              {PADUKUHAN.namaLengkap}
            </p>
            <p className="mt-2 text-sm">
              {PADUKUHAN.desa}, {PADUKUHAN.kapanewon}
              <br />
              {PADUKUHAN.kabupaten}, {PADUKUHAN.provinsi}
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-300">
              Hubungi Kami
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <a
                  href={`tel:${PADUKUHAN.telepon.replace(/[^+\d]/g, '')}`}
                  className="flex items-center gap-2 hover:text-white"
                >
                  <Phone className="h-4 w-4 shrink-0" aria-hidden />
                  {PADUKUHAN.telepon}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${PADUKUHAN.email}`}
                  className="flex items-center gap-2 hover:text-white"
                >
                  <Mail className="h-4 w-4 shrink-0" aria-hidden />
                  {PADUKUHAN.email}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-brand-300">
              Jelajahi
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {JELAJAHI.map((j) => (
                <li key={j.to}>
                  <Link to={j.to} className="hover:text-white">
                    {j.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Di luar footer ungu: `sticky` cuma menempel selama induknya terlihat,
          dan footer itu baru muncul di dasar dokumen.
          Widget mengambang ikut masuk ke bar ini — dulu `fixed` sendiri di atas
          isi halaman, sekarang satu baris dengan kredit. */}
      <BarKredit className="min-h-20 px-4 py-2 sm:px-6 lg:px-8" />
    </div>
  );
}
