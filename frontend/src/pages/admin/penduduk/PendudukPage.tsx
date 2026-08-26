import { PageHeader } from '@/components/layout/PageHeader';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { labelWilayah } from '@/features/auth/wilayah';
import { DaftarPenduduk } from '@/features/penduduk/components/DaftarPenduduk';

/** Data penduduk untuk pengurus: cari nama, saring per kategori, lihat detail. */
export default function PendudukPage() {
  const { user } = useAuth();

  return (
    <div>
      <PageHeader
        title="Data Penduduk"
        description={`Data kependudukan ${labelWilayah(user)}.`}
      />
      <DaftarPenduduk />
    </div>
  );
}
