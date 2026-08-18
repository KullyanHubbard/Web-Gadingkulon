import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { keTanggalLahirIso } from '@/lib/tanggal';
import { pesanError } from '@/lib/utils';
import { paths } from '@/routes/paths';
import { useCekAktivasi, useSetPin } from '../hooks/use-auth';
import {
  aktivasiSchema,
  setPinSchema,
  type AktivasiFormValues,
  type SetPinFormValues,
} from '../schemas';
import type { AktivasiTiket } from '../types';
import { AktivasiCekView } from './AktivasiCekView';
import { AktivasiPinView } from './AktivasiPinView';

/**
 * Alur aktivasi akun warga — dua langkah:
 *  1. NIK + tanggal lahir  -> tiket + nama pemilik NIK (untuk dikonfirmasi)
 *  2. Buat PIN             -> langsung masuk
 *
 * Tidak ada pendaftaran: seluruh NIK sudah ada di data kependudukan. Yang
 * dilakukan warga di sini hanya menetapkan PIN untuk dirinya sendiri.
 *
 * File ini memegang *seluruh* logika alur — kepemilikan tiket menentukan
 * langkah mana yang aktif. Kedua tampilannya tidak tahu-menahu soal itu.
 */
export function AktivasiFlow() {
  const navigate = useNavigate();
  const [tiket, setTiket] = useState<AktivasiTiket | null>(null);

  const cek = useCekAktivasi();
  const setPin = useSetPin();

  const formCek = useForm<AktivasiFormValues>({
    resolver: zodResolver(aktivasiSchema),
    defaultValues: { nik: '', tanggal: '', bulan: '', tahun: '' },
  });

  const formPin = useForm<SetPinFormValues>({
    resolver: zodResolver(setPinSchema),
    defaultValues: { pin: '', ulangiPin: '' },
  });

  const onCek = formCek.handleSubmit(({ nik, ...bagianTanggal }) => {
    // Tiga kolom disatukan jadi satu tanggal ISO di sini — backend tetap
    // menerima bentuk yang sama seperti sebelumnya. `!` aman: skema Zod sudah
    // menolak submit-nya kalau fungsi ini mengembalikan null.
    const tanggalLahir = keTanggalLahirIso(bagianTanggal)!;
    cek.mutate(
      { nik, tanggalLahir },
      { onSuccess: (hasil) => setTiket(hasil) },
    );
  });

  const onSetPin = formPin.handleSubmit(({ pin }) => {
    if (!tiket) return;
    setPin.mutate(
      { tiket: tiket.tiket, pin },
      { onSuccess: () => navigate(paths.beranda, { replace: true }) },
    );
  });

  /** Kembali ke langkah 1 dengan keadaan benar-benar bersih. */
  function ulangiDariAwal() {
    setTiket(null);
    formPin.reset();
    cek.reset();
    setPin.reset();
  }

  if (tiket) {
    return (
      <AktivasiPinView
        nama={tiket.nama}
        onUlangiDariAwal={ulangiDariAwal}
        register={formPin.register}
        errors={{
          pin: formPin.formState.errors.pin?.message,
          ulangiPin: formPin.formState.errors.ulangiPin?.message,
        }}
        onSubmit={onSetPin}
        isPending={setPin.isPending}
        errorMessage={pesanError(
          setPin.error,
          'Gagal menyimpan PIN. Coba lagi.',
        )}
      />
    );
  }

  return (
    <AktivasiCekView
      register={formCek.register}
      errors={{
        nik: formCek.formState.errors.nik?.message,
        // Tiga kolom, satu baris pesan — warga tidak perlu tahu kolom mana
        // yang secara teknis gagal, ia perlu tahu tanggalnya belum benar.
        tanggalLahir:
          formCek.formState.errors.tanggal?.message ??
          formCek.formState.errors.bulan?.message ??
          formCek.formState.errors.tahun?.message,
      }}
      onSubmit={onCek}
      isPending={cek.isPending}
      errorMessage={pesanError(cek.error, 'Gagal memeriksa data. Coba lagi.')}
    />
  );
}
