import type { ReactNode } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { paths } from '@/routes/paths';
import { KreditKkn } from './KreditKkn';
import { Logo } from './Logo';

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
          className="self-start transition-opacity hover:opacity-80"
        >
          {/* Latarnya `brand-700` sementara wordmark-nya ungu tua — `text-*`
              tidak menyentuh berkas SVG, jadi pemutihannya lewat filter. */}
          <Logo className="h-8 brightness-0 invert" />
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

      {/* Kolom form (kanan). `flex-col` + `my-auto`, bukan `justify-center`:
          formnya tetap di tengah tapi kredit pembuat bisa duduk di kaki kolom
          — di bawah `lg` panel brand hilang, jadi ini satu-satunya tempatnya. */}
      <div className="flex flex-col p-6">
        <div className="my-auto w-full max-w-sm self-center">
          <Link to={paths.landing} className="mb-6 block lg:hidden">
            <Logo />
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

        <KreditKkn className="pt-8" />
      </div>
    </div>
  );
}
