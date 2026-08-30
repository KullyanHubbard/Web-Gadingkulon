import { Link } from 'react-router-dom';
import { WADAH } from '@/components/layout/wadah';
import { buttonClass } from '@/components/ui/button-class';
import { QueryBoundary } from '@/components/ui/QueryBoundary';
import { StatCard } from '@/components/ui/StatCard';
import { useStatistikPublik } from '@/features/statistik-publik/hooks/use-statistik-publik';
import ikonKeluarga from '@/assets/icons/keluarga.png';
import ikonLakiLaki from '@/assets/icons/laki-laki.png';
import ikonPenduduk from '@/assets/icons/penduduk.png';
import ikonPerempuan from '@/assets/icons/perempuan.png';
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
    <section className="border-y border-slate-200 bg-white py-16">
      <div className={WADAH}>
        <JudulBagian
          judul="Administrasi Penduduk"
          deskripsi="Ringkasan data kependudukan padukuhan. Angka ini cacah saja — nama dan alamat warga tidak pernah dibuka ke publik."
          aksi={
            <Link
              to={paths.statistik}
              className={buttonClass({ variant: 'outline' })}
            >
              Lihat rincian per RW
            </Link>
          }
        />

        <QueryBoundary
          isLoading={statistik.isLoading}
          isError={statistik.isError}
          data={statistik.data}
          loadingLabel="Memuat ringkasan penduduk"
          errorMessage="Ringkasan penduduk belum bisa ditampilkan."
        >
          {(data) => (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard
                label="Total Penduduk"
                value={formatAngka(data.totalPenduduk)}
                icon={ikonPenduduk}
              />
              {/* "Jumlah KK" dihitung dari cacah kepala keluarga: nomor KK
                  sendiri memang tidak didata lagi (CLAUDE.md), jadi tidak ada
                  kartu keluarga untuk dihitung langsung. */}
              <StatCard
                label="Jumlah KK"
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
          )}
        </QueryBoundary>
      </div>
    </section>
  );
}
