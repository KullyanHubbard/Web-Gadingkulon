import { ChevronRight } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { DistribusiPieChart } from '@/components/ui/DistribusiPieChart';
import { QueryBoundary } from '@/components/ui/QueryBoundary';
import { StatCard } from '@/components/ui/StatCard';
import { CHART_KATEGORI_COLORS } from '@/lib/colors';
import { STAT_WARGA } from '@/lib/stat-warga';
import type { RingkasanStatistik } from '../view-model';

interface StatistikPanelViewProps {
  isLoading: boolean;
  isError: boolean;
  ringkasan: RingkasanStatistik | undefined;
  onPilihRw: (rw: string) => void;
}

/**
 * Tampilan saja — semua angka sudah berupa string dari `view-model.ts`.
 *
 * Tiap baris RW di kartu ringkasan membuka rinciannya, dan itu satu-satunya
 * jalan ke sana di layar kecil: rail kiri disembunyikan di bawah `lg`.
 */
export function StatistikPanelView({
  isLoading,
  isError,
  ringkasan,
  onPilihRw,
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
              warna={CHART_KATEGORI_COLORS}
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

          {/* `flex-1`, bukan lebar mati: kolom kanan yang dipatok `w-72`
              menyisakan ruang kosong lebar di layar besar. */}
          <div className="flex min-w-[18rem] flex-1 flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-3">
              {data.stat.map((stat) => (
                <StatCard
                  key={stat.id}
                  value={stat.value}
                  {...STAT_WARGA[stat.id]}
                />
              ))}
            </div>

            <Card>
              <CardHeader title="Statistik Warga" />
              <ul className="divide-y divide-slate-100 px-5">
                {data.baris.map((baris, i) => (
                  <li key={baris.label}>
                    <button
                      type="button"
                      onClick={() => onPilihRw(baris.label)}
                      className="flex w-full items-center justify-between gap-4 py-3.5 text-left transition-colors hover:text-brand-700"
                    >
                      <span className="flex items-center gap-2.5">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{
                            backgroundColor:
                              CHART_KATEGORI_COLORS[
                                i % CHART_KATEGORI_COLORS.length
                              ],
                          }}
                          aria-hidden
                        />
                        <span className="font-medium text-slate-700">
                          {baris.label}
                        </span>
                      </span>
                      <span className="flex items-center gap-1 text-slate-500">
                        {baris.jumlahTeks}
                        <ChevronRight className="h-4 w-4 text-slate-300" />
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}
    </QueryBoundary>
  );
}
