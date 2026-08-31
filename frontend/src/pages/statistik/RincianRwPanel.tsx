import { PanelDistribusiCard } from '@/components/ui/PanelDistribusiCard';
import { QueryBoundary } from '@/components/ui/QueryBoundary';
import { StatCard } from '@/components/ui/StatCard';
import { useStatistikPublik } from '@/features/statistik-publik/hooks/use-statistik-publik';
import { STAT_WARGA } from '@/lib/stat-warga';
import { toRincianRw } from './view-model';

/**
 * Melayani RW maupun RT: bentuk agregatnya identik (`RincianRw` rekursif), yang
 * berbeda cuma wilayah mana yang dipetik. Query-nya sama dengan panel
 * dashboard, jadi berpindah wilayah tidak memicu permintaan baru.
 *
 * Tanpa judul & tombol kembali — keduanya sudah dibawa `StatistikBreadcrumb`
 * di atas kolom ini.
 */
export function RincianRwPanel({
  rw,
  rt,
  periode,
}: {
  /** Label RW yang dibuka, mis. `'RW 19'`. */
  rw: string;
  /** Label RT di dalam `rw`, mis. `'RT 01'`, atau `null` untuk se-RW. */
  rt: string | null;
  /** Bulan yang sedang dilihat, `YYYY-MM`. */
  periode: string;
}) {
  const { data, isLoading, isError } = useStatistikPublik(periode);
  const indukRw = data?.perRw.find((r) => r.label === rw);
  const rincian =
    rt === null ? indukRw : indukRw?.perRt.find((r) => r.label === rt);

  return (
    <div className="w-full">
      <QueryBoundary
        isLoading={isLoading}
        isError={isError}
        // `undefined` = query belum selesai, `null` = sudah dan wilayahnya
        // tidak ada.
        data={data ? (rincian ? toRincianRw(rincian) : null) : undefined}
        loadingLabel="Memuat statistik"
        errorMessage="Statistik belum bisa ditampilkan. Anda tetap bisa masuk."
        emptyTitle={`${rt ?? rw} tidak ditemukan`}
        emptyDescription="Kembali ke daftar semua RW."
      >
        {(vm) => (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {vm.stat.map((stat) => (
                <StatCard
                  key={stat.id}
                  value={stat.value}
                  {...STAT_WARGA[stat.id]}
                />
              ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              {vm.panels.map((panel) => (
                <PanelDistribusiCard key={panel.id} panel={panel} />
              ))}
            </div>
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}
