import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { DaftarKursiView } from '@/features/pengurus/components/DaftarKursiView';
import { IsiKursiDialog } from '@/features/pengurus/components/IsiKursiDialog';
import { ResetPasswordDialog } from '@/features/pengurus/components/ResetPasswordDialog';
import {
  useDaftarKursi,
  useUbahPengurus,
} from '@/features/pengurus/hooks/use-pengurus';
import type { Kursi } from '@/features/pengurus/types';

/**
 * Kelola kursi perangkat desa. Admin saja — dijaga `RequireRole` di route dan
 * ditegakkan ulang backend, yang juga menutup seluruh data warga dari Admin.
 */
export default function PengurusPage() {
  const { data, isLoading, isError } = useDaftarKursi();
  const ubah = useUbahPengurus();
  const [isiTarget, setIsiTarget] = useState<Kursi | null>(null);
  const [resetTarget, setResetTarget] = useState<Kursi | null>(null);

  function onCabutAkses(kursi: Kursi) {
    const akun = kursi.penghuni;
    if (!akun) return;
    // Konfirmasi wajib: salah pencet memutus akses orang lain, dan yang
    // bersangkutan baru tahu saat gagal masuk.
    const setuju = window.confirm(
      `Cabut akses ${akun.nama} dari kursi ${kursi.jabatan}?\n\n` +
        'Akunnya langsung tidak bisa dipakai, dan kursi ini jadi kosong.',
    );
    if (!setuju) return;
    ubah.mutate({ id: akun.id, payload: { aktif: false } });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Akun Pengurus"
        description="Buatkan akun untuk kursi yang kosong, atau cabut akses saat pengurusnya berganti."
      />

      <DaftarKursiView
        isLoading={isLoading}
        isError={isError}
        kursi={data}
        sedangMengubah={ubah.isPending}
        onIsiKursi={setIsiTarget}
        onResetPassword={setResetTarget}
        onCabutAkses={onCabutAkses}
      />

      <IsiKursiDialog kursi={isiTarget} onClose={() => setIsiTarget(null)} />
      <ResetPasswordDialog
        kursi={resetTarget}
        onClose={() => setResetTarget(null)}
      />
    </div>
  );
}
