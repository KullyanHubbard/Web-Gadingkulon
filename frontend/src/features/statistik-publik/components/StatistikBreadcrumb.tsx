import { toJalurWilayah } from '../view-model';

interface StatistikBreadcrumbProps {
  /** Label RW yang sedang dibuka, atau `null` untuk dashboard. */
  rwAktif: string | null;
  /** Label RT yang sedang dibuka di dalam `rwAktif`, atau `null`. */
  rtAktif: string | null;
  onPilih: (rw: string | null, rt?: string | null) => void;
}

/**
 * Jalur wilayah di bar atas kolom kanan, mis. `Statistik Warga / RW 19 / RT 01`.
 *
 * Tampilan saja: susunan ruasnya datang dari `toJalurWilayah` di `view-model`,
 * komponen ini tidak memutuskan ruas apa yang muncul. Ruas terakhir bukan
 * tautan — itu halaman yang sedang dibuka.
 */
export function StatistikBreadcrumb({
  rwAktif,
  rtAktif,
  onPilih,
}: StatistikBreadcrumbProps) {
  const jalur = toJalurWilayah(rwAktif, rtAktif);

  return (
    <nav aria-label="Jalur wilayah">
      <ol className="flex flex-wrap items-center text-base">
        {jalur.map(({ label, tujuan }, i) => (
          <li key={label} className="flex items-center">
            {i > 0 && (
              <span className="px-2 text-slate-900" aria-hidden>
                /
              </span>
            )}
            {tujuan === null ? (
              <span
                aria-current="page"
                className="font-semibold text-slate-900"
              >
                {label}
              </span>
            ) : (
              <button
                type="button"
                onClick={() => onPilih(tujuan.rw, tujuan.rt)}
                className="font-medium text-slate-900 transition-colors hover:text-brand-700"
              >
                {label}
              </button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
