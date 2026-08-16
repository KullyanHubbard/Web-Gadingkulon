import type { ReactNode } from 'react';
import { PublicSidebar } from './PublicSidebar';
import { PublicTopbar } from './PublicTopbar';

interface PublicLandingLayoutProps {
  /** Rail kiri: daftar bagian statistik. Disembunyikan di layar kecil. */
  nav: ReactNode;
  /** Bar atas kolom kanan: jalur wilayah yang sedang dibuka. */
  breadcrumb: ReactNode;
  /** Kolom kanan: panel statistik. */
  children: ReactNode;
}

/**
 * Kerangka landing page publik: sidebar (atau topbar di layar kecil) + bar
 * breadcrumb + panel statistik.
 *
 * Bar breadcrumb setinggi header sidebar (`h-20`) supaya garis bawah keduanya
 * satu baris, dan padding mendatarnya sama dengan `main` supaya crumb lurus
 * dengan kartu di bawahnya. Tampil di semua ukuran layar: di bawah `lg` rail
 * kiri disembunyikan, jadi bar ini satu-satunya penunjuk posisi.
 *
 * Tanpa footer dengan sengaja. Isinya cuma copyright plus tagline yang sudah
 * ditulis di kaki sidebar — nol informasi, diulang. Atribusinya tinggal di
 * kaki `PublicSidebar`.
 */
export function PublicLandingLayout({
  nav,
  breadcrumb,
  children,
}: PublicLandingLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col lg:grid lg:grid-cols-[20rem_1fr]">
      <PublicSidebar nav={nav} />
      <PublicTopbar />

      {/* Bar & main dibungkus satu sel grid: keduanya menumpuk di kolom kanan,
          bukan dua baris grid yang bisa bergeser dari sidebar. */}
      <div className="flex flex-1 flex-col lg:col-start-2 lg:row-start-1">
        <div className="flex h-20 shrink-0 items-center border-b border-slate-200 bg-white px-6 lg:px-12">
          {breadcrumb}
        </div>

        <main className="flex flex-1 flex-col justify-center px-6 py-10 lg:px-12">
          {children}
        </main>
      </div>
    </div>
  );
}
