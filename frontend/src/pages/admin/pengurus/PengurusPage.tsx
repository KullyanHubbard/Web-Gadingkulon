import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { AjukanPergantianDialog } from '@/features/pergantian/components/AjukanPergantianDialog';
import { DaftarPengajuanView } from '@/features/pergantian/components/DaftarPengajuanView';
import { usePengajuanList } from '@/features/pergantian/hooks/use-pergantian';
import { DaftarKursiView } from '@/features/pengurus/components/DaftarKursiView';
import { IsiKursiDialog } from '@/features/pengurus/components/IsiKursiDialog';
import { ResetPasswordDialog } from '@/features/pengurus/components/ResetPasswordDialog';
import { useDaftarKursi } from '@/features/pengurus/hooks/use-pengurus';
import type { Kursi } from '@/features/pengurus/types';

/**
 * Kelola kursi perangkat desa. Admin saja — dan ia buta terhadap data warga,
 * ditegakkan backend, bukan sekadar disembunyikan menunya.
 *
 * Dua fitur bertemu di halaman ini: daftar kursi milik `pengurus`, dan
 * pengajuan pergantian milik `pergantian`. Keduanya dirakit di sini, bukan
 * saling mengimpor (CLAUDE.md §4).
 */
export default function PengurusPage() {
  const kursi = useDaftarKursi();
  const pengajuan = usePengajuanList();
  const [isiTarget, setIsiTarget] = useState<Kursi | null>(null);
  const [resetTarget, setResetTarget] = useState<Kursi | null>(null);
  const [gantiTarget, setGantiTarget] = useState<Kursi | null>(null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Akun Pengurus"
        description="Isi kursi yang kosong, atau ajukan pergantian untuk kursi yang sudah terisi."
      />

      <DaftarKursiView
        isLoading={kursi.isLoading}
        isError={kursi.isError}
        kursi={kursi.data}
        sedangMengubah={false}
        onIsiKursi={setIsiTarget}
        onResetPassword={setResetTarget}
        onAjukanPergantian={setGantiTarget}
      />

      <DaftarPengajuanView
        isLoading={pengajuan.isLoading}
        isError={pengajuan.isError}
        pengajuan={pengajuan.data}
      />

      <IsiKursiDialog kursi={isiTarget} onClose={() => setIsiTarget(null)} />
      <ResetPasswordDialog
        kursi={resetTarget}
        onClose={() => setResetTarget(null)}
      />
      <AjukanPergantianDialog
        kursi={
          gantiTarget?.penghuni
            ? {
                kursi: gantiTarget.kursi,
                jabatan: gantiTarget.jabatan,
                namaPenghuni: gantiTarget.penghuni.nama,
              }
            : null
        }
        onClose={() => setGantiTarget(null)}
      />
    </div>
  );
}
