import ikonDashboard from '@/assets/icons/dashboard.png';
import ikonRt from '@/assets/icons/rt-icon.png';
import ikonRw from '@/assets/icons/rw-icon.png';
import { cn } from '@/lib/utils';
import { useStatistikPublik } from '../hooks/use-statistik-publik';

interface StatistikNavProps {
  /** Label RW yang sedang dibuka, atau `null` untuk dashboard. */
  rwAktif: string | null;
  /** Label RT yang sedang dibuka di dalam `rwAktif`, atau `null`. */
  rtAktif: string | null;
  onPilih: (rw: string | null, rt?: string | null) => void;
}

function itemClass(aktif: boolean) {
  return cn(
    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-base font-medium transition-colors',
    aktif ? 'bg-brand-50 text-brand-700' : 'text-slate-900 hover:bg-slate-50',
  );
}

/**
 * Rail kiri halaman depan. Sub-baris RT selalu tampil tanpa buka-tutup: satu
 * padukuhan cuma punya beberapa RT, jadi daftarnya tetap pendek.
 *
 * Wilayahnya dari query yang sama dengan panelnya — React Query menyatukannya
 * jadi satu permintaan, jadi nav tidak perlu dioper data lewat props.
 */
export function StatistikNav({ rwAktif, rtAktif, onPilih }: StatistikNavProps) {
  const { data, isError } = useStatistikPublik();

  return (
    <nav aria-label="Bagian statistik" className="space-y-7">
      <button
        type="button"
        onClick={() => onPilih(null)}
        aria-current={rwAktif === null ? 'page' : undefined}
        className={itemClass(rwAktif === null)}
      >
        {/* `alt` kosong: labelnya persis di sebelah, ikon cuma hiasan. */}
        <img src={ikonDashboard} alt="" className="h-5 w-5 shrink-0" />
        Dashboard
      </button>

      <div>
        <p className="px-3 text-sm font-semibold uppercase tracking-widest text-slate-900">
          Statistik Warga
        </p>

        {data ? (
          <ul className="mt-2 space-y-1">
            {data.perRw.map((rw) => (
              <li key={rw.label}>
                <button
                  type="button"
                  onClick={() => onPilih(rw.label)}
                  aria-current={
                    rwAktif === rw.label && rtAktif === null
                      ? 'page'
                      : undefined
                  }
                  className={itemClass(
                    rwAktif === rw.label && rtAktif === null,
                  )}
                >
                  <img src={ikonRw} alt="" className="h-5 w-5 shrink-0" />
                  <span className="flex-1 text-left">{rw.label}</span>
                </button>

                {rw.perRt.length > 0 && (
                  // Indentasi saja sebagai penanda hierarki — tanpa garis
                  // vertikal, tanpa penambah lebar.
                  <ul className="ml-8 mt-1 space-y-1">
                    {rw.perRt.map((rt) => {
                      const aktif =
                        rwAktif === rw.label && rtAktif === rt.label;
                      return (
                        <li key={rt.label}>
                          <button
                            type="button"
                            onClick={() => onPilih(rw.label, rt.label)}
                            aria-current={aktif ? 'page' : undefined}
                            className={cn(itemClass(aktif), 'py-2 text-sm')}
                          >
                            <img
                              src={ikonRt}
                              alt=""
                              className="h-5 w-5 shrink-0"
                            />
                            <span className="flex-1 text-left">{rt.label}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 rounded-lg border border-dashed border-slate-200 px-3 py-3 text-xs leading-relaxed text-slate-400">
            {isError
              ? 'Rincian per RW belum bisa dimuat.'
              : 'Memuat rincian per RW…'}
          </p>
        )}
      </div>
    </nav>
  );
}
