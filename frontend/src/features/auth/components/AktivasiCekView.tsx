import type { FormEventHandler } from 'react';
import type { UseFormRegister } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { paths } from '@/routes/paths';
import type { AktivasiFormValues } from '../schemas';
import { AuthLayout } from './AuthLayout';

interface AktivasiCekViewProps {
  register: UseFormRegister<AktivasiFormValues>;
  errors: { nik?: string; tanggalLahir?: string };
  onSubmit: FormEventHandler<HTMLFormElement>;
  isPending: boolean;
  errorMessage: string | null;
}

/** Aktivasi langkah 1 — cocokkan NIK dengan tanggal lahir. Tampilan saja. */
export function AktivasiCekView({
  register,
  errors,
  onSubmit,
  isPending,
  errorMessage,
}: AktivasiCekViewProps) {
  return (
    <AuthLayout
      title="Aktifkan akun"
      description="Sekali saja, untuk warga yang baru pertama kali masuk."
    >
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {errorMessage && <Alert tone="error">{errorMessage}</Alert>}

        <Input
          label="NIK"
          className="h-12 text-base"
          inputMode="numeric"
          maxLength={16}
          placeholder="16 digit angka"
          error={errors.nik}
          {...register('nik')}
        />
        <Input
          label="Tanggal lahir"
          type="date"
          className="h-12 text-base"
          hint="Sesuai yang tertulis di KTP / Kartu Keluarga."
          error={errors.tanggalLahir}
          {...register('tanggalLahir')}
        />

        <Button
          type="submit"
          size="lg"
          className="w-full"
          isLoading={isPending}
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
