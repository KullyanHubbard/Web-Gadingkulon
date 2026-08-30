import { useSearchParams } from 'react-router-dom';
import { PublicLandingLayout } from '@/components/layout/PublicLandingLayout';
import { StatistikBreadcrumb } from '@/features/statistik-publik/components/StatistikBreadcrumb';
import { StatistikNav } from '@/features/statistik-publik/components/StatistikNav';
import { StatistikPanel } from '@/features/statistik-publik/components/StatistikPanel';
import { RincianRwPanel } from './RincianRwPanel';

/**
 * Wilayah aktif hidup di URL (`/?rw=RW+19&rt=RT+1`), bukan `useState`, demi
 * tombol Back: pembacanya mayoritas di ponsel, dan dengan state biasa Back dari
 * rincian RW keluar dari situs alih-alih kembali ke dashboard.
 *
 * `rt` tidak pernah berdiri sendiri tanpa `rw`: nomor RT kebetulan unik
 * se-padukuhan di dataset sekarang, tapi penomoran berulang per RW tetap sah.
 *
 * Kuncinya label apa adanya (`'RW 19'`), bukan kode wilayah — itu satu-satunya
 * bentuk yang dikirim `/publik/statistik`. Tautan lama mati kalau
 * `format_rw`/`format_rt` di backend berubah.
 */
export default function StatistikPage() {
  const [params, setParams] = useSearchParams();
  const rwAktif = params.get('rw');
  const rtAktif = rwAktif === null ? null : params.get('rt');

  const pilih = (rw: string | null, rt: string | null = null) =>
    setParams(rw ? (rt ? { rw, rt } : { rw }) : {});

  return (
    <PublicLandingLayout
      nav={<StatistikNav rwAktif={rwAktif} rtAktif={rtAktif} onPilih={pilih} />}
      breadcrumb={
        <StatistikBreadcrumb
          rwAktif={rwAktif}
          rtAktif={rtAktif}
          onPilih={pilih}
        />
      }
    >
      {rwAktif === null ? (
        <StatistikPanel onPilihRw={pilih} />
      ) : (
        <RincianRwPanel rw={rwAktif} rt={rtAktif} />
      )}
    </PublicLandingLayout>
  );
}
