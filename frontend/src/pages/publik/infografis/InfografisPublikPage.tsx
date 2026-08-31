import { useSearchParams } from 'react-router-dom';
import { PanelDistribusiCard } from '@/components/ui/PanelDistribusiCard';
import ikonKeluarga from '@/assets/icons/keluarga.png';
import ikonLakiLaki from '@/assets/icons/laki-laki.png';
import ikonPenduduk from '@/assets/icons/penduduk.png';
import ikonPerempuan from '@/assets/icons/perempuan.png';
import { QueryBoundary } from '@/components/ui/QueryBoundary';
import { StatCard } from '@/components/ui/StatCard';
import { useStatistikPublik } from '@/features/statistik-publik/hooks/use-statistik-publik';
import { PADUKUHAN } from '@/lib/padukuhan';
import { cn, formatAngka } from '@/lib/utils';
import { PANEL_BANSOS, TOTAL_PENERIMA_BANSOS } from './bansos';
import { toPanelDemografi } from './view-model';
import { WADAH } from '@/components/layout/wadah';

const TAB = [
  { id: 'demografi', label: 'Demografi Penduduk' },
  { id: 'bansos', label: 'Bantuan Sosial' },
] as const;

type TabId = (typeof TAB)[number]['id'];

/**
 * Infografis publik: demografi penduduk & bantuan sosial.
 *
 * Tab aktif hidup di URL (`/infografis?tab=bansos`), bukan `useState` — alasan
 * yang sama dengan wilayah aktif di halaman statistik: dengan state biasa,
 * tombol Back dari tab kedua keluar dari situs alih-alih kembali ke tab
 * pertama, dan tab tertentu tidak bisa ditautkan dari mana pun.
 */
export default function InfografisPublikPage() {
  const [params, setParams] = useSearchParams();
  const tabAktif: TabId =
    params.get('tab') === 'bansos' ? 'bansos' : 'demografi';

  const { data, isLoading, isError } = useStatistikPublik();

  return (
    <div className="flex flex-col">
      <section className="bg-brand-950 py-14 text-white">
        <div className={WADAH}>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-300">
            Infografis
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Data {PADUKUHAN.namaLengkap}
          </h1>
        </div>
      </section>

      {/* Tab sebagai bilah tersendiri di bawah judul: `sticky` supaya tetap
          terjangkau saat panel bawah digulung. */}
      <div className="sticky top-16 z-20 border-b border-slate-200 bg-surface">
        <div className={`${WADAH} flex gap-1 overflow-x-auto`} role="tablist">
          {TAB.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tabAktif === t.id}
              onClick={() =>
                setParams(t.id === 'demografi' ? {} : { tab: t.id })
              }
              className={cn(
                'whitespace-nowrap border-b-2 px-4 py-4 text-sm font-semibold transition-colors',
                tabAktif === t.id
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-slate-500 hover:text-slate-800',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <section className={`${WADAH} py-10`}>
        {tabAktif === 'demografi' ? (
          <QueryBoundary
            isLoading={isLoading}
            isError={isError}
            data={data}
            loadingLabel="Memuat infografis"
            errorMessage="Infografis belum bisa ditampilkan."
          >
            {(statistik) => (
              <div className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    label="Total Penduduk"
                    value={formatAngka(statistik.totalPenduduk)}
                    icon={ikonPenduduk}
                  />
                  <StatCard
                    label="Jumlah Kartu Keluarga"
                    value={formatAngka(statistik.totalKepalaKeluarga)}
                    icon={ikonKeluarga}
                  />
                  <StatCard
                    label="Laki-laki"
                    value={formatAngka(statistik.totalLakiLaki)}
                    icon={ikonLakiLaki}
                  />
                  <StatCard
                    label="Perempuan"
                    value={formatAngka(statistik.totalPerempuan)}
                    icon={ikonPerempuan}
                  />
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  {toPanelDemografi(statistik).map((panel) => (
                    <PanelDistribusiCard key={panel.id} panel={panel} />
                  ))}
                </div>
              </div>
            )}
          </QueryBoundary>
        ) : (
          <div className="space-y-6">
            {/* Peringatan sumber data dipasang menyolok, bukan sebagai catatan
                kaki: angka bansos di halaman ini belum berasal dari pendataan
                mana pun, dan angka yang salah dikira resmi lebih berbahaya
                daripada halaman yang kosong. */}
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
              <p className="font-semibold">Data contoh</p>
              <p className="mt-1">
                Status penerima bantuan sosial belum termasuk yang didata pada
                sistem ini. Angka di bawah adalah contoh tampilan, bukan data
                penerima yang sebenarnya.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Total Penerima"
                value={formatAngka(TOTAL_PENERIMA_BANSOS)}
                icon={ikonKeluarga}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {PANEL_BANSOS.map((panel) => (
                <PanelDistribusiCard key={panel.id} panel={panel} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
