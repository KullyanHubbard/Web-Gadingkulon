import type { ReactNode } from 'react';
import { PublicFooter } from './PublicFooter';
import { PublicSidebar } from './PublicSidebar';
import { PublicTopbar } from './PublicTopbar';

interface PublicLandingLayoutProps {
  /** Rail kiri: daftar bagian statistik. Disembunyikan di layar kecil. */
  nav: ReactNode;
  /** Kolom kanan: panel statistik. */
  children: ReactNode;
}

/** Kerangka landing page publik: sidebar (atau topbar di layar kecil) + panel statistik. */
export function PublicLandingLayout({
  nav,
  children,
}: PublicLandingLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col lg:grid lg:grid-cols-[20rem_1fr]">
      <PublicSidebar nav={nav} />
      <PublicTopbar />

      <main className="flex flex-1 flex-col justify-center px-6 py-10 lg:col-start-2 lg:row-start-1 lg:px-12">
        {children}
      </main>

      <PublicFooter />
    </div>
  );
}
