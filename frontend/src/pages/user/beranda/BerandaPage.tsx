import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { LoadingBlock } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { EmptyState } from '@/components/ui/EmptyState';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { paths } from '@/routes/paths';
import {
  useKartuKeluarga,
  usePendudukByNik,
} from '@/features/penduduk/hooks/use-penduduk';
import { PendudukDetail } from '@/features/penduduk/components/PendudukDetail';
import { KartuKeluargaCard } from '@/features/penduduk/components/KartuKeluargaCard';

/**
 * Beranda warga: menampilkan HANYA data milik NIK yang login,
 * plus anggota Kartu Keluarganya.
 */
export default function BerandaPage() {
  const { user, isUser } = useAuth();
  const nik = user?.nik ?? '';
  // Ajakan sekali jalan — kontak murni opsional, jadi hanya muncul selama
  // keduanya masih kosong dan tidak pernah menghalangi isi halaman.
  const perluLengkapiKontak = isUser && !user?.noHp && !user?.email;

  const pendudukQuery = usePendudukByNik(nik);
  const penduduk = pendudukQuery.data;

  const kkQuery = useKartuKeluarga(penduduk?.noKK ?? '', Boolean(penduduk));

  return (
    <div>
      <PageHeader
        title={`Halo, ${user?.nama ?? 'Warga'} 👋`}
        description="Berikut data kependudukan Anda dan anggota keluarga."
      />

      {perluLengkapiKontak && (
        <div className="mb-6">
          <Alert tone="info">
            Nomor HP dan email Anda belum terisi.{' '}
            <Link
              to={paths.kontak}
              className="font-medium underline underline-offset-2"
            >
              Lengkapi kontak
            </Link>{' '}
            agar pengurus padukuhan bisa menghubungi Anda. Boleh dilewati.
          </Alert>
        </div>
      )}

      {pendudukQuery.isLoading ? (
        <LoadingBlock label="Memuat data Anda…" />
      ) : pendudukQuery.isError ? (
        <Alert tone="error">
          Gagal memuat data. Silakan muat ulang halaman.
        </Alert>
      ) : !penduduk ? (
        <EmptyState
          title="Data tidak ditemukan"
          description={`Tidak ada data kependudukan untuk NIK ${nik}. Hubungi perangkat desa.`}
        />
      ) : (
        <div className="space-y-6">
          <PendudukDetail penduduk={penduduk} />
          {kkQuery.data && <KartuKeluargaCard kk={kkQuery.data} />}
        </div>
      )}
    </div>
  );
}
