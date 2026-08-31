import { Headset } from 'lucide-react';
import { PADUKUHAN } from '@/lib/padukuhan';

/**
 * Tombol mengambang pengaduan warga: `mailto:` ke email padukuhan.
 *
 * Bukan formulir dengan penyimpanan sendiri — itu fitur terpisah (perlu
 * backend, moderasi, dsb) yang belum ada spesifikasinya. `mailto:` cukup untuk
 * "ada jalur pengaduan" tanpa membangun subsistem baru.
 */
export function TombolPengaduan() {
  return (
    <a
      href={`mailto:${PADUKUHAN.email}?subject=${encodeURIComponent('Pengaduan Warga')}`}
      className="focus-ring flex items-center gap-2 rounded-full bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-rose-700"
    >
      <Headset className="h-5 w-5" aria-hidden />
      Pengaduan
    </a>
  );
}
