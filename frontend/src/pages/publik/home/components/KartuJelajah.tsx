import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

/** Satu pintu masuk di bagian "Jelajahi Padukuhan". */
export function KartuJelajah({
  ke,
  judul,
  deskripsi,
  ikon,
}: {
  ke: string;
  judul: string;
  deskripsi: string;
  ikon: ReactNode;
}) {
  return (
    <Link
      to={ke}
      className="focus-ring group flex flex-col rounded-xl border border-slate-200 bg-surface p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg"
    >
      {ikon}
      <h3 className="mt-4 text-lg font-bold text-slate-900">{judul}</h3>
      <p className="mt-2 flex-1 text-sm text-slate-600">{deskripsi}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
        Buka halaman
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
