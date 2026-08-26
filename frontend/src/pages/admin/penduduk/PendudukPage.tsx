import { PageHeader } from '@/components/layout/PageHeader';
import { DaftarPenduduk } from '@/features/penduduk/components/DaftarPenduduk';

/** Data penduduk untuk pengurus: cari nama, saring per kategori, lihat detail. */
export default function PendudukPage() {
  return (
    <div>
      <PageHeader
        title="Data Penduduk"
        description="Seluruh data kependudukan padukuhan."
      />
      <DaftarPenduduk />
    </div>
  );
}
