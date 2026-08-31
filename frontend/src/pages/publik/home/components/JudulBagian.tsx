import type { ReactNode } from 'react';

/** Judul + deskripsi satu bagian beranda, dengan tombol opsional di kanan. */
export function JudulBagian({
  judul,
  deskripsi,
  aksi,
  className,
}: {
  judul: string;
  deskripsi?: string;
  aksi?: ReactNode;
  className?: string;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className={`text-2xl font-bold text-slate-900 sm:text-3xl ${className ?? ''}`}>
          {judul}
        </h2>
        {deskripsi && (
          <p className="mt-2 max-w-2xl text-sm text-slate-600">{deskripsi}</p>
        )}
      </div>
      {aksi}
    </div>
  );
}
