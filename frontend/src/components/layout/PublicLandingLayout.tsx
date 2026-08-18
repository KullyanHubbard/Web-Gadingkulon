import type { ReactNode } from 'react';
import { KreditKkn } from './KreditKkn';
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
 * Footernya cuma kredit pembuat — sengaja tidak ada copyright atau tagline di
 * situ, dua-duanya sudah ditulis di kaki `PublicSidebar` dan cuma jadi
 * pengulangan. Kreditnya ada di sini, bukan di sidebar, karena sidebar
 * disembunyikan di bawah `lg` dan pembacanya mayoritas di ponsel.
 *
 * Mulai `lg` tingginya dikunci ke viewport dan cuma `main` yang menggulung,
 * supaya rail kiri & footer tidak ikut terdorong ke dasar dokumen di rincian
 * RW yang panjang. Di bawah `lg` menggulung normal — lihat `DashboardLayout`,
 * alasannya sama.
 */
export function PublicLandingLayout({
  nav,
  breadcrumb,
  children,
}: PublicLandingLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col lg:grid lg:h-dvh lg:min-h-0 lg:grid-cols-[20rem_1fr] lg:overflow-hidden">
      <PublicSidebar nav={nav} />
      <PublicTopbar />

      {/* Bar & main dibungkus satu sel grid: keduanya menumpuk di kolom kanan,
          bukan dua baris grid yang bisa bergeser dari sidebar. */}
      <div className="flex flex-1 flex-col lg:col-start-2 lg:row-start-1 lg:min-h-0">
        <div className="flex h-20 shrink-0 items-center border-b border-slate-200 bg-white px-6 lg:px-12">
          {breadcrumb}
        </div>

        {/* Penengah vertikalnya `my-auto` di anak, bukan `justify-center` di
            `main`: begitu isinya lebih tinggi dari kotak gulung, `justify-center`
            memotong ujung atas dan bagian itu tidak bisa digulung sama sekali. */}
        <main className="flex flex-1 flex-col px-6 py-10 lg:overflow-y-auto lg:px-12">
          <div className="my-auto w-full">{children}</div>
        </main>

        <KreditKkn className="shrink-0 border-t border-slate-200 bg-white px-6 py-4 lg:px-12" />
      </div>
    </div>
  );
}
