import { env } from '@/config/env';

/** Footer landing page publik: baris tunggal, rapi, di bawah konten utama. */
export function PublicFooter() {
  const tahun = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white px-6 py-4 text-center text-xs text-slate-400 lg:col-span-2 lg:px-12">
      © {tahun} {env.appName} — Portal Data Kependudukan Padukuhan
    </footer>
  );
}
