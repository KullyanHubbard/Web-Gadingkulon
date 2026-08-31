import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { pesanError } from '@/lib/utils';
import { useUbahLpm } from '../hooks/use-pengurus';
import { namaLpmSchema, type NamaLpmFormValues } from '../schemas';

interface UbahLpmDialogProps {
  open: boolean;
  /** Nama saat ini, buat prefill. `null`/kosong berarti belum diisi. */
  namaSaatIni: string | null;
  onClose: () => void;
}

/**
 * Ganti nama Ketua LPM. Beda dari dialog jabatan lain di fitur ini: tanpa
 * pencarian warga, tanpa username/password — LPM tidak terhubung ke data
 * warga maupun tabel `pengurus` sama sekali (CLAUDE.md §11).
 */
export function UbahLpmDialog({
  open,
  namaSaatIni,
  onClose,
}: UbahLpmDialogProps) {
  const ubah = useUbahLpm();

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm<NamaLpmFormValues>({
    resolver: zodResolver(namaLpmSchema),
    defaultValues: { nama: namaSaatIni ?? '' },
  });

  useEffect(() => {
    if (open) resetForm({ nama: namaSaatIni ?? '' });
  }, [open, namaSaatIni, resetForm]);

  const onSubmit = handleSubmit((values) => {
    ubah.mutate(values.nama, { onSuccess: onClose });
  });

  return (
    <Modal open={open} onClose={onClose} title="Ubah Nama Ketua LPM">
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Nama"
          error={errors.nama?.message}
          {...register('nama')}
        />
        {ubah.error && (
          <Alert tone="error">
            {pesanError(ubah.error, 'Gagal mengubah nama Ketua LPM.')}
          </Alert>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" isLoading={ubah.isPending}>
            Simpan
          </Button>
        </div>
      </form>
    </Modal>
  );
}
