import { Link } from 'react-router-dom';
import { Newspaper } from 'lucide-react';
import { cn } from '@/lib/utils';
import { paths } from '@/routes/paths';
import type { Berita } from '../types';
import { formatTanggal, keParagraf } from '../utils';

/**
 * Tempat foto utama. Berita tanpa foto tetap dapat kotak dengan ikon, bukan
 * ruang kosong — grid yang sebagian kartunya bergambar dan sebagian tidak
 * terbaca rusak, bukan bervariasi.
 */
export function FotoBerita({
  berita,
  className,
}: {
  berita: Berita;
  className?: string;
}) {
  if (berita.foto) {
    return (
      <img
        src={berita.foto}
        alt={berita.judul}
        className={cn('object-cover', className)}
      />
    );
  }
  return (
    <div
      className={cn(
        'flex items-center justify-center bg-gradient-to-br from-slate-200 to-slate-100',
        className,
      )}
      aria-hidden
    >
      <Newspaper className="h-8 w-8 text-slate-400" />
    </div>
  );
}

/** Kartu berita untuk grid daftar & pratinjau beranda. */
export function BeritaCard({ berita }: { berita: Berita }) {
  const [pembuka] = keParagraf(berita.isi);

  return (
    <Link
      to={paths.beritaDetail(berita.slug)}
      className="focus-ring group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-surface shadow-sm transition-shadow hover:shadow-md"
    >
      <FotoBerita berita={berita} className="h-44 w-full" />
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-700">
          {formatTanggal(berita.tanggalTerbit)}
        </p>
        <h3 className="mt-2 text-lg font-bold leading-snug text-slate-900 group-hover:text-brand-700">
          {berita.judul}
        </h3>
        {pembuka && (
          <p className="mt-2 line-clamp-3 text-sm text-slate-600">{pembuka}</p>
        )}
        <p className="mt-auto pt-4 text-xs text-slate-500">
          Oleh {berita.penulis}
        </p>
      </div>
    </Link>
  );
}

/** Baris ringkas untuk sidebar "Berita Terkini": thumbnail kecil + judul. */
export function BeritaBarisRingkas({ berita }: { berita: Berita }) {
  return (
    <Link
      to={paths.beritaDetail(berita.slug)}
      className="focus-ring group flex gap-3 rounded-lg p-2 transition-colors hover:bg-slate-50"
    >
      <FotoBerita berita={berita} className="h-16 w-20 shrink-0 rounded-md" />
      <div className="min-w-0">
        <h4 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-800 group-hover:text-brand-700">
          {berita.judul}
        </h4>
        <p className="mt-1 text-xs text-slate-500">
          {formatTanggal(berita.tanggalTerbit)}
        </p>
      </div>
    </Link>
  );
}
