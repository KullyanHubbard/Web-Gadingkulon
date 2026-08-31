import { useState, type ReactNode } from 'react';
import { AccountButton } from './AccountButton';
import { BarKredit } from './BarKredit';
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
 * Footernya bar kredit yang sama dengan `PublicShell`, lengkap dengan
 * penghitung kunjungan & tombol pengaduan/ukuran teks/tema — sengaja tidak ada copyright atau tagline di
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
  const [navOpen, setNavOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col lg:grid lg:h-dvh lg:min-h-0 lg:grid-cols-[20rem_1fr] lg:overflow-hidden">
      <PublicSidebar
        nav={nav}
        open={navOpen}
        onClose={() => setNavOpen(false)}
      />
      <PublicTopbar onOpenNav={() => setNavOpen(true)} />

      {/* Bar & main dibungkus satu sel grid: keduanya menumpuk di kolom kanan,
          bukan dua baris grid yang bisa bergeser dari sidebar. */}
      <div className="flex flex-1 flex-col lg:col-start-2 lg:row-start-1 lg:min-h-0">
        <div className="flex h-16 sm:h-20 shrink-0 items-center justify-between gap-4 border-b border-slate-200 bg-surface px-4 sm:px-6 lg:px-12">
          {breadcrumb}
          {/* Pintu masuk di sudut kanan bar atas — disembunyikan di bawah lg karena PublicTopbar sudah membawanya */}
          <AccountButton className="shrink-0 hidden lg:flex" />
        </div>

        {/* Penengah vertikalnya `my-auto` di anak, bukan `justify-center` di
            `main`: begitu isinya lebih tinggi dari kotak gulung, `justify-center`
            memotong ujung atas dan bagian itu tidak bisa digulung sama sekali. */}
        <main className="flex flex-1 flex-col px-4 py-6 sm:px-6 sm:py-10 lg:overflow-y-auto lg:px-12">
          <div className="my-auto w-full">{children}</div>
        </main>

        <BarKredit className="min-h-20 shrink-0 px-6 py-2 lg:px-12" />
      </div>
    </div>
  );
}
