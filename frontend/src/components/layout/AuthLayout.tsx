import type { ReactNode } from 'react';
import { ArrowLeft, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { env } from '@/config/env';
import { paths } from '@/routes/paths';

interface AuthLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/**
 * Kerangka halaman publik (masuk & aktivasi): panel brand + kolom form.
 *
 * Ketiga halaman yang memakainya adalah jalan buntu tanpa ini: pengunjung
 * datang dari landing, berubah pikiran, dan tidak punya jalan pulang selain
 * mengetik ulang URL. Jalan pulangnya dua — logo (konvensi, tidak terlihat
 * sebagai tombol) dan tautan teks di atas judul (yang benar-benar terbaca).
 */
export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panel brand (kiri) — disembunyikan di layar kecil. */}
      <div className="relative hidden flex-col justify-between bg-brand-700 p-12 text-white lg:flex">
        <Link
          to={paths.landing}
          className="flex items-center gap-2 self-start text-lg font-semibold transition-opacity hover:opacity-80"
        >
          <Building2 className="h-6 w-6" />
          {env.appName}
        </Link>
        <div>
          <h1 className="text-3xl font-bold leading-tight">
            Portal Data Kependudukan Padukuhan
          </h1>
          <p className="mt-3 max-w-md text-brand-100">
            Warga dapat melihat data dirinya sendiri beserta anggota Kartu
            Keluarganya. Pengurus padukuhan mengelola seluruh data & infografis.
          </p>
        </div>
        <p className="text-sm text-brand-200">
          © {new Date().getFullYear()} Pemerintah Padukuhan
        </p>
      </div>

      {/* Kolom form (kanan) */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <Link
            to={paths.landing}
            className="mb-6 flex items-center gap-2 lg:hidden"
          >
            <Building2 className="h-6 w-6 text-brand-600" />
            <span className="text-lg font-semibold text-slate-900">
              {env.appName}
            </span>
          </Link>

          <Link
            to={paths.landing}
            className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition-colors hover:text-brand-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke dashboard
          </Link>

          <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          )}

          {children}
        </div>
      </div>
    </div>
  );
}
