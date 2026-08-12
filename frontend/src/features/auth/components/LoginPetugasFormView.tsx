import type { FormEventHandler, ReactNode } from 'react';
import type { UseFormRegister } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { paths } from '@/routes/paths';
import type { PetugasLoginFormValues } from '../schemas';
import { AuthLayout } from './AuthLayout';

interface LoginPetugasFormViewProps {
  register: UseFormRegister<PetugasLoginFormValues>;
  errors: { username?: string; password?: string };
  onSubmit: FormEventHandler<HTMLFormElement>;
  isPending: boolean;
  errorMessage: string | null;
  catatanDemo?: ReactNode;
}

/** Tampilan form masuk pengurus. Tanpa hook — lihat `LoginPetugasForm`. */
export function LoginPetugasFormView({
  register,
  errors,
  onSubmit,
  isPending,
  errorMessage,
  catatanDemo,
}: LoginPetugasFormViewProps) {
  return (
    <AuthLayout
      title="Masuk sebagai pengurus"
      description="Untuk Dukuh, RW, dan RT."
    >
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {errorMessage && <Alert tone="error">{errorMessage}</Alert>}

        <Input
          label="Username"
          autoComplete="username"
          placeholder="cth. dukuh"
          error={errors.username}
          {...register('username')}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password}
          {...register('password')}
        />

        <Button type="submit" className="w-full" isLoading={isPending}>
          Masuk
        </Button>
      </form>

      <div className="mt-6 border-t border-slate-100 pt-4">
        <Link
          to={paths.login}
          className="text-sm text-slate-500 underline underline-offset-2 hover:text-slate-700"
        >
          Kembali ke halaman masuk warga
        </Link>
      </div>

      {catatanDemo}
    </AuthLayout>
  );
}
