import { ChevronRight } from 'lucide-react';
import { Card, CardHeader } from '@/components/ui/Card';
import { DistribusiPieChart } from '@/components/ui/DistribusiPieChart';
import { QueryBoundary } from '@/components/ui/QueryBoundary';
import { StatCard } from '@/components/ui/StatCard';
import { CHART_KATEGORI_COLORS } from '@/lib/colors';
import { STAT_WARGA } from '@/lib/stat-warga';
import type { RingkasanStatistik } from '../view-model';
import { CountUp } from './CountUp';

interface StatistikPanelViewProps {
  isLoading: boolean;
  isError: boolean;
  ringkasan: RingkasanStatistik | undefined;
  onPilihRw: (rw: string) => void;
}

/**
 * Tampilan saja — angka sudah berupa string dari `view-model.ts`, kecuali total
 * di tengah donut yang sengaja mentah karena `CountUp` memformatnya per bingkai.
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
        // Dua kolom setara: donut dulu berdiri tanpa kartu dan mendominasi,
        // sementara kolom kanan menggantung setengah tinggi.
        <div className="grid items-stretch gap-6 lg:grid-cols-2">
          <Card className="flex flex-col">
            <CardHeader title="Sebaran Warga per RW" />
            <div className="flex-1 p-4">
              <DistribusiPieChart
                data={data.distribusi}
                height={420}
                showLegend={false}
                warna={CHART_KATEGORI_COLORS}
                labelIrisan={(i) => {
                  const baris = data.baris[i];
                  return baris ? [baris.label, baris.persenTeks] : [];
                }}
                center={
                  <>
                    {/* Hero figure: di sini `tabular-nums` justru WAJIB meski
                      angka display biasanya lebih baik tanpanya — angkanya
                      berubah tiap bingkai, dan lebar digit proporsional bikin
                      seluruh angka bergoyang kiri-kanan selama menghitung. */}
                    <CountUp
                      value={data.total}
                      className="text-6xl font-bold tabular-nums leading-none text-slate-900"
                    />
                    <span className="mt-2 text-xs font-medium uppercase tracking-widest text-slate-400">
                      jiwa
                    </span>
                  </>
                }
              />
            </div>
          </Card>

          {/* Kolom kanan menyamakan tinggi ke kartu donut: kartu daftar RW yang
              `flex-1` yang memanjang, bukan kartu jenis kelamin. */}
          <div className="flex flex-col gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {data.stat.map((stat) => (
                <StatCard
                  key={stat.id}
                  value={stat.value}
                  {...STAT_WARGA[stat.id]}
                />
              ))}
            </div>

            <Card className="flex flex-1 flex-col">
              <CardHeader title="Statistik Warga" />
              <ul className="flex-1 divide-y divide-slate-100 px-5">
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
                        <ChevronRight className="h-4 w-4 text-slate-400" />
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
