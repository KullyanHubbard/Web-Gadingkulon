import type { FormEventHandler } from 'react';
import type { UseFormRegister } from 'react-hook-form';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { SetPinFormValues } from '../schemas';
import { AuthLayout } from './AuthLayout';

interface AktivasiPinViewProps {
  /** Nama pemilik NIK, untuk dikonfirmasi warga sebelum membuat PIN. */
  nama: string;
  onUlangiDariAwal: () => void;
  register: UseFormRegister<SetPinFormValues>;
  errors: { pin?: string; ulangiPin?: string };
  onSubmit: FormEventHandler<HTMLFormElement>;
  isPending: boolean;
  errorMessage: string | null;
}

/** Aktivasi langkah 2 — tetapkan PIN. Tampilan saja. */
export function AktivasiPinView({
  nama,
  onUlangiDariAwal,
  register,
  errors,
  onSubmit,
  isPending,
  errorMessage,
}: AktivasiPinViewProps) {
  return (
    <AuthLayout
      title="Buat PIN Anda"
      description="PIN ini yang Anda pakai setiap kali masuk. Jangan beri tahu siapa pun."
    >
      <div className="mt-6 rounded-lg border border-brand-200 bg-brand-50 p-3.5 text-sm text-brand-900">
        Data ditemukan atas nama <b>{nama}</b>.
        <button
          type="button"
          onClick={onUlangiDariAwal}
          className="focus-ring ml-1 rounded underline underline-offset-2"
        >
          Bukan Anda?
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-4 space-y-4">
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
          error={errors.pin}
          {...register('pin')}
        />
        <Input
          label="Ulangi PIN"
          type="password"
          className="h-12 text-base tracking-widest"
          inputMode="numeric"
          maxLength={6}
          autoComplete="new-password"
          placeholder="••••••"
          error={errors.ulangiPin}
          {...register('ulangiPin')}
        />

        <Button
          type="submit"
          size="lg"
          className="w-full"
          isLoading={isPending}
        >
          Simpan PIN & Masuk
        </Button>
      </form>
    </AuthLayout>
  );
}
