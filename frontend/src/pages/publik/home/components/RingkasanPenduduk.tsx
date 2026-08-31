import { Link } from 'react-router-dom';
import { WADAH } from '@/components/layout/wadah';
import ikonKeluarga from '@/assets/icons/keluarga.png';
import ikonLakiLaki from '@/assets/icons/laki-laki.png';
import ikonPenduduk from '@/assets/icons/penduduk.png';
import ikonPerempuan from '@/assets/icons/perempuan.png';
import { QueryBoundary } from '@/components/ui/QueryBoundary';
import { StatCard } from '@/components/ui/StatCard';
import { useStatistikPublik } from '@/features/statistik-publik/hooks/use-statistik-publik';
import petaSatelit from '@/assets/BG-padding/Bg-padding.jpg';
import { formatAngka } from '@/lib/utils';
import { paths } from '@/routes/paths';
import { JudulBagian } from './JudulBagian';

/**
 * Empat angka ringkas dari `/publik/statistik` — cacah saja, tanpa nama &
 * alamat.
 */
export function RingkasanPenduduk() {
  const statistik = useStatistikPublik();

  return (
    <section className="border-y border-slate-200 bg-surface py-16">
      <div className={WADAH}>
        <JudulBagian judul="ADMINISTRASI PENDUDUK" className="uppercase" />

        <QueryBoundary
          isLoading={statistik.isLoading}
          isError={statistik.isError}
          data={statistik.data}
          loadingLabel="Memuat ringkasan penduduk"
          errorMessage="Ringkasan penduduk belum bisa ditampilkan."
        >
          {(data) => (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  label="Total Penduduk"
                  value={formatAngka(data.totalPenduduk)}
                  icon={ikonPenduduk}
                />
                <StatCard
                  label="Jumlah Kartu Keluarga"
                  value={formatAngka(data.totalKepalaKeluarga)}
                  icon={ikonKeluarga}
                />
                <StatCard
                  label="Laki-laki"
                  value={formatAngka(data.totalLakiLaki)}
                  icon={ikonLakiLaki}
                />
                <StatCard
                  label="Perempuan"
                  value={formatAngka(data.totalPerempuan)}
                  icon={ikonPerempuan}
                />
              </div>

              <div className="relative mt-8 overflow-hidden rounded-2xl bg-gradient-to-br from-[#2E1065] via-[#3B1280] to-[#1E0A45] p-5 text-white shadow-2xl shadow-purple-950/50 sm:p-10 lg:p-12">
                {/* Peta satelit Donokerto — menyatu di background card */}
                <img
                  src={petaSatelit}
                  alt=""
                  aria-hidden="true"
                  width={900}
                  height={443}
                  loading="lazy"
                  decoding="async"
                  className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-20 mix-blend-luminosity"
                />

                {/* Content: Text left — CTA right */}
                <div className="relative z-10 flex flex-col items-center gap-6 lg:flex-row lg:justify-between">
                  <div className="max-w-lg text-center lg:text-left">
                    <h3 className="text-xl font-bold leading-snug tracking-tight sm:text-3xl">
                      Eksplorasi Data Kependudukan
                    </h3>
                    <p className="mt-3 text-xs leading-relaxed text-purple-200/90 sm:text-base">
                      Visualisasi data demografi terpadu hingga tingkat RT
                      secara transparan dan terbuka.
                    </p>
                  </div>

                  <Link
                    to={paths.statistik}
                    className="inline-flex w-full shrink-0 items-center justify-center rounded-xl bg-white px-7 py-3.5 text-center text-sm font-semibold text-purple-900 shadow-lg transition-all duration-200 hover:bg-purple-50 hover:shadow-xl active:scale-[0.98] sm:w-auto sm:text-base"
                  >
                    Jelajahi Statistik Warga
                  </Link>
                </div>
              </div>
            </>
          )}
        </QueryBoundary>
      </div>
    </section>
  );
}
