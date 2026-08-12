import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { pesanError } from '@/lib/utils';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { useCekAktivasi, useSetPin } from '@/features/auth/hooks/use-auth';
import {
  aktivasiSchema,
  setPinSchema,
  type AktivasiFormValues,
  type SetPinFormValues,
} from '@/features/auth/schemas';
import type { AktivasiTiket } from '@/features/auth/types';
import { paths } from '@/routes/paths';

/**
 * Aktivasi akun warga, dua langkah dalam satu halaman:
 *  1. NIK + tanggal lahir  -> tiket + nama pemilik NIK (untuk dikonfirmasi)
 *  2. Buat PIN             -> langsung masuk
 *
 * Tidak ada pendaftaran: seluruh NIK sudah ada di data kependudukan. Yang
 * dilakukan warga di sini hanya menetapkan PIN untuk dirinya sendiri.
 */
export default function AktivasiPage() {
  const navigate = useNavigate();
  const [tiket, setTiket] = useState<AktivasiTiket | null>(null);

  const cek = useCekAktivasi();
  const setPin = useSetPin();

  const formCek = useForm<AktivasiFormValues>({
    resolver: zodResolver(aktivasiSchema),
    defaultValues: { nik: '', tanggalLahir: '' },
  });

  const formPin = useForm<SetPinFormValues>({
    resolver: zodResolver(setPinSchema),
    defaultValues: { pin: '', ulangiPin: '' },
  });

  const onCek = formCek.handleSubmit((values) => {
    cek.mutate(values, { onSuccess: (hasil) => setTiket(hasil) });
  });

  const onSetPin = formPin.handleSubmit(({ pin }) => {
    if (!tiket) return;
    setPin.mutate(
      { tiket: tiket.tiket, pin },
      { onSuccess: () => navigate(paths.beranda, { replace: true }) },
    );
  });

  function ulangiDariAwal() {
    setTiket(null);
    formPin.reset();
    cek.reset();
    setPin.reset();
  }

  // ---- Langkah 2: buat PIN --------------------------------------------------
  if (tiket) {
    const errorMessage = pesanError(
      setPin.error,
      'Gagal menyimpan PIN. Coba lagi.',
    );

    return (
      <AuthLayout
        title="Buat PIN Anda"
        description="PIN ini yang Anda pakai setiap kali masuk. Jangan beri tahu siapa pun."
      >
        <div className="mt-6 rounded-lg border border-brand-200 bg-brand-50 p-3.5 text-sm text-brand-900">
          Data ditemukan atas nama <b>{tiket.nama}</b>.
          <button
            type="button"
            onClick={ulangiDariAwal}
            className="focus-ring ml-1 rounded underline underline-offset-2"
          >
            Bukan Anda?
          </button>
        </div>

        <form onSubmit={onSetPin} className="mt-4 space-y-4">
          {errorMessage && <Alert tone="error">{errorMessage}</Alert>}

          <Input
            label="PIN baru"
            type="password"
            className="h-12 text-base tracking-widest"
            inputMode="numeric"
            maxLength={6}
            autoComplete="new-password"
            placeholder="••••••"
            hint="6 angka. Pilih yang mudah Anda ingat, jangan tanggal lahir."
            error={formPin.formState.errors.pin?.message}
            {...formPin.register('pin')}
          />
          <Input
            label="Ulangi PIN"
            type="password"
            className="h-12 text-base tracking-widest"
            inputMode="numeric"
            maxLength={6}
            autoComplete="new-password"
            placeholder="••••••"
            error={formPin.formState.errors.ulangiPin?.message}
            {...formPin.register('ulangiPin')}
          />

          <Button
            type="submit"
            size="lg"
            className="w-full"
            isLoading={setPin.isPending}
          >
            Simpan PIN & Masuk
          </Button>
        </form>
      </AuthLayout>
    );
  }

  // ---- Langkah 1: cocokkan NIK + tanggal lahir ------------------------------
  const errorMessage = pesanError(
    cek.error,
    'Gagal memeriksa data. Coba lagi.',
  );

  return (
    <AuthLayout
      title="Aktifkan akun"
      description="Sekali saja, untuk warga yang baru pertama kali masuk."
    >
      <form onSubmit={onCek} className="mt-6 space-y-4">
        {errorMessage && <Alert tone="error">{errorMessage}</Alert>}

        <Input
          label="NIK"
          className="h-12 text-base"
          inputMode="numeric"
          maxLength={16}
          placeholder="16 digit angka"
          hint="Lihat di KTP Anda, baris paling atas."
          error={formCek.formState.errors.nik?.message}
          {...formCek.register('nik')}
        />
        <Input
          label="Tanggal lahir"
          type="date"
          className="h-12 text-base"
          hint="Sesuai yang tertulis di KTP / Kartu Keluarga."
          error={formCek.formState.errors.tanggalLahir?.message}
          {...formCek.register('tanggalLahir')}
        />

        <Button
          type="submit"
          size="lg"
          className="w-full"
          isLoading={cek.isPending}
        >
          Lanjut
        </Button>
      </form>

      <p className="mt-6 text-sm text-slate-600">
        Sudah punya PIN?{' '}
        <Link
          to={paths.login}
          className="font-medium text-brand-700 underline underline-offset-2"
        >
          Masuk di sini
        </Link>
      </p>
    </AuthLayout>
  );
}
