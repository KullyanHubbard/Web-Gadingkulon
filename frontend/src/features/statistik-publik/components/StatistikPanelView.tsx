import { DistribusiPieChart } from '@/components/ui/DistribusiCharts';
import { QueryBoundary } from '@/components/ui/QueryBoundary';
import type { RingkasanStatistik } from '../view-model';

interface StatistikPanelViewProps {
  isLoading: boolean;
  isError: boolean;
  ringkasan: RingkasanStatistik | undefined;
}

/**
 * Panel statistik di kolom tengah halaman masuk: satu donut besar, tanpa judul
 * dan tanpa legenda. Seluruh keterangan hidup di dalam chart — nama RW beserta
 * jumlah jiwanya dicetak di atas irisannya, totalnya di lubang donut.
 *
 * Tampilan saja: semua angka sudah berupa string dari `view-model.ts`.
 */
export function StatistikPanelView({
  isLoading,
  isError,
  ringkasan,
}: StatistikPanelViewProps) {
  return (
    <QueryBoundary
      isLoading={isLoading}
      isError={isError}
      data={ringkasan}
      loadingLabel="Memuat statistik"
      errorMessage="Statistik belum bisa ditampilkan. Anda tetap bisa masuk."
    >
      {(data) => (
        <DistribusiPieChart
          data={data.distribusi}
          height={640}
          showLegend={false}
          labelIrisan={(i) => {
            const baris = data.baris[i];
            return baris ? [baris.label, baris.persenTeks] : [];
          }}
          center={
            <>
              {/* Hero figure: sengaja TANPA tabular-nums — angka lebar-tetap
                  terlihat renggang di ukuran display. Itu untuk kolom angka
                  yang harus lurus ke bawah, bukan untuk satu angka besar. */}
              <span className="text-7xl font-bold leading-none text-slate-900">
                {data.totalTeks}
              </span>
              <span className="mt-2 text-xs font-medium uppercase tracking-widest text-slate-400">
                jiwa
              </span>
            </>
          }
        />
      )}
    </QueryBoundary>
  );
}
