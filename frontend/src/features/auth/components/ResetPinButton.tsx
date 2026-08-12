import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { pesanError } from '@/lib/utils';
import { useResetPinWarga } from '../hooks/use-auth';
import { ResetPinDialogView } from './ResetPinDialogView';

interface ResetPinButtonProps {
  nik: string;
  nama: string;
}

/**
 * Aksi pengurus: reset PIN seorang warga.
 *
 * Ini SATU-SATUNYA jalur pemulihan akun — tidak ada OTP, SMS, atau email.
 * Karena itu verifikasi identitas terjadi di luar aplikasi: warga menemui
 * pengurus membawa KTP, pengurus menekan tombol ini.
 *
 * Container: memegang state dialog + mutation. Isi dialognya di
 * `ResetPinDialogView`.
 */
export function ResetPinButton({ nik, nama }: ResetPinButtonProps) {
  const [open, setOpen] = useState(false);
  const reset = useResetPinWarga();

  function tutup() {
    setOpen(false);
    // Buang hasil mutation supaya dialog dibuka lagi dalam keadaan bersih.
    reset.reset();
  }

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <KeyRound className="h-4 w-4" />
        Reset PIN
      </Button>

      <ResetPinDialogView
        open={open}
        onClose={tutup}
        nik={nik}
        nama={nama}
        isSuccess={reset.isSuccess}
        isPending={reset.isPending}
        errorMessage={pesanError(reset.error, 'Gagal mereset PIN. Coba lagi.')}
        onKonfirmasi={() => reset.mutate(nik)}
      />
    </>
  );
}
