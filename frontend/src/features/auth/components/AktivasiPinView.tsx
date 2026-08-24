import type { FormEventHandler } from 'react';
import type { UseFormRegister } from 'react-hook-form';
import { KeyRound } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { PasswordInput } from '@/components/ui/PasswordInput';
import type { SetPinFormValues } from '../schemas';
import { AuthLayout } from '@/components/layout/AuthLayout';

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
    <AuthLayout title="Buat PIN Anda">
      <div className="mt-6 rounded-lg border-1 border-brand-200 bg-brand-50 p-3.5 text-sm text-brand-900">
        <p>
          Data ditemukan atas nama <b>{nama}</b>.
        </p>
        <button
          type="button"
          onClick={onUlangiDariAwal}
          className="focus-ring mt-1 rounded underline underline-offset-2"
        >
          Bukan Anda?
        </button>
      </div>

      <form onSubmit={onSubmit} className="mt-4 space-y-4">
        {errorMessage && <Alert tone="error">{errorMessage}</Alert>}

        <PasswordInput
          label="PIN baru"
          className="h-12 text-base tracking-widest"
          icon={<KeyRound className="h-4 w-4" />}
          inputMode="numeric"
          maxLength={6}
          autoComplete="new-password"
          error={errors.pin}
          {...register('pin')}
        />
        <PasswordInput
          label="Ulangi PIN"
          className="h-12 text-base tracking-widest"
          icon={<KeyRound className="h-4 w-4" />}
          inputMode="numeric"
          maxLength={6}
          autoComplete="new-password"
          error={errors.ulangiPin}
          {...register('ulangiPin')}
        />

        <Button
          type="submit"
          size="lg"
          className="w-full active:scale-[0.99]"
          isLoading={isPending}
        >
          Simpan PIN & Masuk
        </Button>
      </form>
    </AuthLayout>
  );
}
