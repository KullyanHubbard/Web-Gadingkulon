import type { ReactNode } from 'react';
import { Building2 } from 'lucide-react';
import { env } from '@/config/env';

interface AuthLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
}

/** Kerangka halaman publik (masuk & aktivasi): panel brand + kolom form. */
export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Panel brand (kiri) — disembunyikan di layar kecil. */}
      <div className="relative hidden flex-col justify-between bg-brand-700 p-12 text-white lg:flex">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <Building2 className="h-6 w-6" />
          {env.appName}
        </div>
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
          <div className="mb-6 flex items-center gap-2 lg:hidden">
            <Building2 className="h-6 w-6 text-brand-600" />
            <span className="text-lg font-semibold text-slate-900">
              {env.appName}
            </span>
          </div>

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
