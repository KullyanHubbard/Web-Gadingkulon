import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Alert } from '@/components/ui/Alert';
import { pesanError } from '@/lib/utils';
import { useResetPinWarga } from '../hooks/use-auth';

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
 */
export function ResetPinButton({ nik, nama }: ResetPinButtonProps) {
  const [open, setOpen] = useState(false);
  const reset = useResetPinWarga();

  function tutup() {
    setOpen(false);
    reset.reset();
  }

  const errorMessage = pesanError(reset.error, 'Gagal mereset PIN. Coba lagi.');

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}>
        <KeyRound className="h-4 w-4" />
        Reset PIN
      </Button>

      <Modal open={open} onClose={tutup} title="Reset PIN warga">
        <div className="space-y-4">
          {errorMessage && <Alert tone="error">{errorMessage}</Alert>}

          {reset.isSuccess ? (
            <>
              <Alert tone="success">
                PIN <b>{nama}</b> sudah direset.
              </Alert>
              <p className="text-sm text-slate-600">
                Sampaikan ke yang bersangkutan: buka halaman masuk, pilih{' '}
                <b>Aktifkan akun</b>, lalu masukkan NIK dan tanggal lahirnya
                untuk membuat PIN baru.
              </p>
              <Button onClick={tutup}>Selesai</Button>
            </>
          ) : (
            <>
              <p className="text-sm text-slate-600">
                PIN <b>{nama}</b> (NIK {nik}) akan dihapus. Yang bersangkutan
                harus mengaktifkan akunnya lagi dengan NIK + tanggal lahir untuk
                membuat PIN baru.
              </p>
              <Alert tone="info">
                Lakukan hanya bila warganya <b>hadir langsung</b> dan Anda
                mengenalinya. Jangan mereset atas permintaan lewat telepon atau
                pesan.
              </Alert>
              <div className="flex gap-2">
                <Button
                  variant="danger"
                  isLoading={reset.isPending}
                  onClick={() => reset.mutate(nik)}
                >
                  Ya, reset PIN
                </Button>
                <Button variant="ghost" onClick={tutup}>
                  Batal
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </>
  );
}
