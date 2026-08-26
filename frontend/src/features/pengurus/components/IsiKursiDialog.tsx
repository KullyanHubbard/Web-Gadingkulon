import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { pesanError } from '@/lib/utils';
import { useTambahPengurus } from '../hooks/use-pengurus';
import { isiKursiSchema, type IsiKursiFormValues } from '../schemas';
import type { Kursi } from '../types';

interface IsiKursiDialogProps {
  /** Kursi yang sedang diisi; `null` = dialog tertutup. */
  kursi: Kursi | null;
  onClose: () => void;
}

/**
 * Buatkan akun untuk satu kursi kosong.
 *
 * Kursinya sudah ditentukan barisnya, jadi form ini tidak menanyakan jabatan,
 * RW, maupun RT — tiganya ikut apa adanya dari kursi yang diklik.
 */
export function IsiKursiDialog({ kursi, onClose }: IsiKursiDialogProps) {
  const tambah = useTambahPengurus();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IsiKursiFormValues>({
    resolver: zodResolver(isiKursiSchema),
    defaultValues: { nama: '', username: '', password: '' },
  });

  // Nama diisikan dari kolom Jabatan file Excel, tapi tetap bisa diubah: Excel
  // menandai siapa yang seharusnya, bukan menentukan siapa yang akhirnya.
  useEffect(() => {
    if (kursi?.calon) reset({ nama: kursi.calon.nama, username: '', password: '' });
  }, [kursi, reset]);

  function tutup() {
    reset();
    tambah.reset();
    onClose();
  }

  const onSubmit = handleSubmit((values) => {
    if (!kursi) return;
    tambah.mutate(
      {
        ...values,
        role: kursi.role,
        rw: kursi.rw ?? undefined,
        rt: kursi.rt ?? undefined,
      },
      { onSuccess: tutup },
    );
  });

  return (
    <Modal
      open={Boolean(kursi)}
      onClose={tutup}
      title={`Buatkan Akun — ${kursi?.jabatan ?? ''}`}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        <Input
          label="Nama Lengkap"
          hint={
            kursi?.calon
              ? 'Terisi dari kolom Jabatan di file Excel. Ubah kalau orangnya berbeda.'
              : undefined
          }
          error={errors.nama?.message}
          {...register('nama')}
        />
        <Input
          label="Username"
          autoComplete="off"
          error={errors.username?.message}
          {...register('username')}
        />
        <PasswordInput
          label="Password Awal"
          autoComplete="new-password"
          hint="Serahkan tatap muka. Dia wajib menggantinya saat pertama masuk, dan setelah itu password ini tidak berlaku lagi."
          error={errors.password?.message}
          {...register('password')}
        />
        {tambah.error && (
          <Alert tone="error">
            {pesanError(tambah.error, 'Gagal membuatkan akun.')}
          </Alert>
        )}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={tutup}>
            Batal
          </Button>
          <Button type="submit" isLoading={tambah.isPending}>
            Buatkan Akun
          </Button>
        </div>
      </form>
    </Modal>
  );
}
