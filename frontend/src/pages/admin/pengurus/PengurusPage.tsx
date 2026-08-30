import { useState } from 'react';
import { AjukanPergantianDialog } from '@/features/pergantian/components/AjukanPergantianDialog';
import { DaftarPengajuanView } from '@/features/pergantian/components/DaftarPengajuanView';
import { usePengajuanList } from '@/features/pergantian/hooks/use-pergantian';
import { DaftarJabatanView } from '@/features/pengurus/components/DaftarJabatanView';
import { IsiJabatanDialog } from '@/features/pengurus/components/IsiJabatanDialog';
import { ResetPasswordDialog } from '@/features/pengurus/components/ResetPasswordDialog';
import { useDaftarJabatan } from '@/features/pengurus/hooks/use-pengurus';
import type { Jabatan } from '@/features/pengurus/types';

/**
 * Kelola jabatan perangkat desa. Admin saja — dan ia buta terhadap data warga,
 * ditegakkan backend, bukan sekadar disembunyikan menunya.
 *
 * Dua fitur bertemu di halaman ini: daftar jabatan milik `pengurus`, dan
 * pengajuan pergantian milik `pergantian`. Keduanya dirakit di sini, bukan
 * saling mengimpor (CLAUDE.md §4).
 */
export default function PengurusPage() {
  const jabatan = useDaftarJabatan();
  const pengajuan = usePengajuanList();
  const [isiTarget, setIsiTarget] = useState<Jabatan | null>(null);
  const [resetTarget, setResetTarget] = useState<Jabatan | null>(null);
  const [gantiTarget, setGantiTarget] = useState<Jabatan | null>(null);

  return (
    <div className="space-y-6">
      <DaftarJabatanView
        isLoading={jabatan.isLoading}
        isError={jabatan.isError}
        jabatan={jabatan.data}
        sedangMengubah={false}
        onIsiJabatan={setIsiTarget}
        onResetPassword={setResetTarget}
        onAjukanPergantian={setGantiTarget}
      />

      <DaftarPengajuanView
        isLoading={pengajuan.isLoading}
        isError={pengajuan.isError}
        pengajuan={pengajuan.data}
      />

      <IsiJabatanDialog
        jabatan={isiTarget}
        onClose={() => setIsiTarget(null)}
      />
      <ResetPasswordDialog
        jabatan={resetTarget}
        onClose={() => setResetTarget(null)}
      />
      <AjukanPergantianDialog
        jabatan={
          gantiTarget?.pemegang
            ? {
                kode: gantiTarget.kode,
                label: gantiTarget.label,
                namaPemegang: gantiTarget.pemegang.nama,
              }
            : null
        }
        onClose={() => setGantiTarget(null)}
      />
    </div>
  );
}
