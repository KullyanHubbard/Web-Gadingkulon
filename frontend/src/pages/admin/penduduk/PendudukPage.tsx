import { useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { ResetPinButton } from '@/features/auth/components/ResetPinButton';
import { useNikBerakun } from '@/features/auth/hooks/use-auth';
import { DaftarPenduduk } from '@/features/penduduk/components/DaftarPenduduk';

/**
 * Data penduduk untuk pengurus.
 *
 * Halaman inilah yang mempertemukan dua fitur: daftar milik `penduduk`, dan
 * aksi Reset PIN milik `auth` yang disuntik sebagai aksi baris. Siapa saja yang
 * akunnya sudah aktif dibaca sekali di sini, bukan per baris.
 */
export default function PendudukPage() {
  const { data: nikBerakun } = useNikBerakun();
  const berakun = useMemo(() => new Set(nikBerakun), [nikBerakun]);

  return (
    <div>
      <PageHeader
        title="Data Penduduk"
        description="Seluruh data kependudukan padukuhan."
      />

      <DaftarPenduduk
        renderAksi={(row) => (
          <ResetPinButton
            nik={row.nik}
            nama={row.nama}
            akunAktif={berakun.has(row.nik)}
          />
        )}
      />
    </div>
  );
}
