import { useMemo } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { labelWilayah } from '@/features/auth/wilayah';
import { RiwayatView } from '@/features/audit/components/RiwayatView';
import { useRiwayat } from '@/features/audit/hooks/use-audit';
import { toBarisRiwayat } from '@/features/audit/view-model';

/**
 * Riwayat perubahan. Satu halaman, dua isi yang berbeda:
 *
 * - Pengurus melihat perubahan data warga **di wilayahnya**.
 * - Admin melihat perubahan akun, dan tidak pernah melihat data warga.
 *
 * Yang memilah backend; halaman ini cuma menyesuaikan judulnya supaya orang
 * tahu riwayat apa yang sedang dibacanya.
 */
export default function RiwayatPage() {
  const { user, isAdmin } = useAuth();
  const { data, isLoading, isError } = useRiwayat();

  const baris = useMemo(() => data?.map(toBarisRiwayat), [data]);

  return (
    <div>
      <PageHeader
        title="Riwayat Perubahan"
        description={
          isAdmin
            ? 'Catatan pembuatan akun dan reset password pengurus.'
            : `Catatan perubahan data warga ${labelWilayah(user)}.`
        }
      />
      <RiwayatView
        isLoading={isLoading}
        isError={isError}
        baris={baris}
        kosongJudul="Belum ada perubahan tercatat"
        kosongKeterangan={
          isAdmin
            ? 'Pembuatan akun dan reset password akan muncul di sini.'
            : 'Setiap perubahan data warga akan muncul di sini, lengkap dengan siapa yang mengubahnya.'
        }
      />
    </div>
  );
}
