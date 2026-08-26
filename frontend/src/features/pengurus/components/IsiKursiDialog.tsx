import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { PilihWarga } from '@/components/ui/PilihWarga';
import { useCariWarga } from '@/hooks/use-cari-warga';
import { useDebounce } from '@/hooks/use-debounce';
import { pesanError } from '@/lib/utils';
import type { WargaPilihan } from '@/lib/warga-api';
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
 *
 * Orangnya **dipilih dari data warga, bukan diketik**: Admin buta terhadap isi
 * data kependudukan, jadi ia tidak punya cara tahu nama siapa yang benar. Kotak
 * pencarian ini sama persis dengan yang dipakai saat mengajukan pergantian.
 */
export function IsiKursiDialog({ kursi, onClose }: IsiKursiDialogProps) {
  const tambah = useTambahPengurus();
  const [cari, setCari] = useState('');
  const [warga, setWarga] = useState<WargaPilihan | null>(null);
  const debounced = useDebounce(cari);
  const { data: hasil, isFetching } = useCariWarga(debounced);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<IsiKursiFormValues>({
    resolver: zodResolver(isiKursiSchema),
    defaultValues: { username: '', password: '' },
  });

  // Kalau kolom Jabatan di Excel sudah menandai orangnya, ia langsung terpilih.
  useEffect(() => {
    if (!kursi) return;
    setWarga(
      kursi.calon
        ? { id: kursi.calon.id, nama: kursi.calon.nama, rt: '', rw: '' }
        : null,
    );
    setCari('');
  }, [kursi]);

  function tutup() {
    reset();
    tambah.reset();
    setCari('');
    setWarga(null);
    onClose();
  }

  const onSubmit = handleSubmit((values) => {
    if (!kursi || !warga) return;
    tambah.mutate(
      {
        ...values,
        nama: warga.nama,
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
        <PilihWarga
          label="Siapa yang menduduki kursi ini"
          hint={
            kursi?.calon
              ? 'Sudah terpilih dari kolom Jabatan di file Excel. Cari nama lain kalau orangnya berbeda.'
              : undefined
          }
          cari={cari}
          onCariChange={setCari}
          hasil={hasil}
          sedangMencari={isFetching}
          terpilih={warga}
          onPilih={setWarga}
        />

        <Input
          label="Username"
          autoComplete="off"
          hint="Saran: dukuh, rw019, rt001 — pendek dan gampang diingat."
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
          <Button type="submit" disabled={!warga} isLoading={tambah.isPending}>
            Buatkan Akun
          </Button>
        </div>
      </form>
    </Modal>
  );
}
