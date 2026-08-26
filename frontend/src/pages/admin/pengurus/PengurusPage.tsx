import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { DaftarPengurusView } from '@/features/pengurus/components/DaftarPengurusView';
import { PengurusForm } from '@/features/pengurus/components/PengurusForm';
import { ResetPasswordDialog } from '@/features/pengurus/components/ResetPasswordDialog';
import {
  usePengurusList,
  useUbahPengurus,
} from '@/features/pengurus/hooks/use-pengurus';
import type { Pengurus } from '@/features/pengurus/types';

/**
 * Kelola akun perangkat desa. ADMIN saja — dijaga `RequireRole` di route dan
 * ditegakkan ulang backend.
 */
export default function PengurusPage() {
  const { user } = useAuth();
  const { data, isLoading, isError } = usePengurusList();
  const ubah = useUbahPengurus();
  const [resetTarget, setResetTarget] = useState<Pengurus | null>(null);

  function onToggleAktif(akun: Pengurus) {
    // Konfirmasi wajib: salah pencet memutus akses orang lain, dan yang
    // bersangkutan baru tahu saat gagal masuk.
    const aksi = akun.aktif ? 'Nonaktifkan' : 'Aktifkan';
    if (!window.confirm(`${aksi} akun ${akun.nama} (${akun.username})?`)) return;
    ubah.mutate({ id: akun.id, payload: { aktif: !akun.aktif } });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Akun Pengurus"
        description="Tambah, nonaktifkan, dan reset password akun Dukuh/RW/RT."
      />

      <DaftarPengurusView
        isLoading={isLoading}
        isError={isError}
        daftar={data}
        idSaya={user?.id}
        sedangMengubah={ubah.isPending}
        onToggleAktif={onToggleAktif}
        onResetPassword={setResetTarget}
      />

      <PengurusForm />

      <ResetPasswordDialog
        akun={resetTarget}
        onClose={() => setResetTarget(null)}
      />
    </div>
  );
}
