import { useSearchParams } from 'react-router-dom';
import { PublicLandingLayout } from '@/components/layout/PublicLandingLayout';
import { periodeBulanIni } from '@/lib/tanggal';
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
  const bulanIni = periodeBulanIni();
  const periode = params.get('periode') ?? bulanIni;

  /** Satu penulis query supaya wilayah & periode tidak saling menghapus. */
  const ubah = (rw: string | null, rt: string | null, periodeBaru: string) =>
    setParams({
      ...(rw ? (rt ? { rw, rt } : { rw }) : {}),
      // Bulan berjalan tidak ditulis ke URL — itu keadaan bawaannya.
      ...(periodeBaru === bulanIni ? {} : { periode: periodeBaru }),
    });

  const pilih = (rw: string | null, rt: string | null = null) =>
    ubah(rw, rt, periode);

  return (
    <PublicLandingLayout
      nav={
        <StatistikNav
          rwAktif={rwAktif}
          rtAktif={rtAktif}
          onPilih={pilih}
          periode={periode}
          onPilihPeriode={(p) => ubah(rwAktif, rtAktif, p)}
        />
      }
      breadcrumb={
        <StatistikBreadcrumb
          rwAktif={rwAktif}
          rtAktif={rtAktif}
          onPilih={pilih}
        />
      }
    >
      {rwAktif === null ? (
        <StatistikPanel onPilihRw={pilih} periode={periode} />
      ) : (
        <RincianRwPanel rw={rwAktif} rt={rtAktif} periode={periode} />
      )}
    </PublicLandingLayout>
  );
}
