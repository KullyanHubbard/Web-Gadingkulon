import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';

interface ResetPinDialogViewProps {
  open: boolean;
  onClose: () => void;
  nik: string;
  nama: string;
  /** Sudah tereset — tampilkan instruksi lanjutan, bukan lagi konfirmasi. */
  isSuccess: boolean;
  isPending: boolean;
  errorMessage: string | null;
  onKonfirmasi: () => void;
}

/** Dialog konfirmasi reset PIN. Tampilan saja — lihat `ResetPinButton`. */
export function ResetPinDialogView({
  open,
  onClose,
  nik,
  nama,
  isSuccess,
  isPending,
  errorMessage,
  onKonfirmasi,
}: ResetPinDialogViewProps) {
  return (
    <Modal open={open} onClose={onClose} title="Reset PIN warga">
      <div className="space-y-4">
        {errorMessage && <Alert tone="error">{errorMessage}</Alert>}

        {isSuccess ? (
          <>
            <Alert tone="success">
              PIN <b>{nama}</b> sudah direset.
            </Alert>
            <p className="text-sm text-slate-600">
              Sampaikan ke yang bersangkutan: buka halaman masuk, pilih{' '}
              <b>Aktifkan akun</b>, lalu masukkan NIK dan tanggal lahirnya untuk
              membuat PIN baru.
            </p>
            <Button onClick={onClose}>Selesai</Button>
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
                isLoading={isPending}
                onClick={onKonfirmasi}
              >
                Ya, reset PIN
              </Button>
              <Button variant="ghost" onClick={onClose}>
                Batal
              </Button>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}
