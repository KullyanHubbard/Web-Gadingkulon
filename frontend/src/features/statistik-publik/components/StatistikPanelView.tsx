import { Card, CardHeader } from '@/components/ui/Card';
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
 * Panel statistik di kolom tengah halaman masuk: donut di kiri (dekat
 * sidebar), tanpa judul dan tanpa legenda bawaan. Nama RW & persentasenya
 * dicetak langsung di irisannya (statis, tanpa hover — interaksi tooltip
 * menyusul), totalnya di lubang donut. Di kanan donut, kartu ringkasan jumlah
 * warga per RW.
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
        <div className="flex flex-wrap items-center gap-12">
          <div className="w-[36rem] max-w-full shrink-0">
            <DistribusiPieChart
              data={data.distribusi}
              height={576}
              showLegend={false}
              warna={CHART_RW_COLORS}
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
          </div>

          <Card className="w-72 max-w-full shrink-0">
            <CardHeader title="Statistik Warga" />
            <ul className="divide-y divide-slate-100 px-5">
              {data.baris.map((baris, i) => (
                <li
                  key={baris.label}
                  className="flex items-center justify-between gap-4 py-3"
                >
                  <span className="flex items-center gap-2.5">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{
                        backgroundColor:
                          CHART_RW_COLORS[i % CHART_RW_COLORS.length],
                      }}
                      aria-hidden
                    />
                    <span className="font-medium text-slate-700">
                      {baris.label}
                    </span>
                  </span>
                  <span className="text-sm text-slate-500">
                    {baris.jumlahTeks}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </QueryBoundary>
  );
}
