import { DistribusiPieChart } from '@/components/ui/DistribusiCharts';
import { QueryBoundary } from '@/components/ui/QueryBoundary';
import { CHART_RW_COLORS } from '@/lib/colors';
import type { RingkasanStatistik } from '../view-model';

interface StatistikPanelViewProps {
  isLoading: boolean;
  isError: boolean;
  ringkasan: RingkasanStatistik | undefined;
}

/**
 * Panel statistik di kolom tengah halaman masuk: satu donut, tanpa judul dan
 * tanpa legenda. Nama RW dicetak di irisannya, persentasenya muncul saat hover,
 * totalnya di lubang donut.
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
          height={384}
          showLegend={false}
          warna={CHART_RW_COLORS}
          labelIrisan={(i) => {
            const baris = data.baris[i];
            // Persentase pindah ke tooltip; label irisan cukup nama RW.
            return baris ? [baris.label] : [];
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
