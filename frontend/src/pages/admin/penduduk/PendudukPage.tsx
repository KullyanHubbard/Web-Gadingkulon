import { PageHeader } from '@/components/layout/PageHeader';
import { ResetPinButton } from '@/features/auth/components/ResetPinButton';
import { DaftarPenduduk } from '@/features/penduduk/components/DaftarPenduduk';

/**
 * Data penduduk untuk pengurus.
 *
 * Halaman inilah yang mempertemukan dua fitur: daftar milik `penduduk`, dan
 * aksi Reset PIN milik `auth` yang disuntik sebagai aksi baris.
 */
export default function PendudukPage() {
  return (
    <div>
      <PageHeader
        title="Data Penduduk"
        description="Seluruh data kependudukan Desa Sukamaju."
      />

      <DaftarPenduduk
        renderAksi={(row) => <ResetPinButton nik={row.nik} nama={row.nama} />}
      />
    </div>
  );
}
