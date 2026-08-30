import type { FormEventHandler } from 'react';
import type { UseFormRegister } from 'react-hook-form';
import { KeyRound, UserRound } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import type { PetugasLoginFormValues } from '../schemas';
import type { Role } from '../types';
import { PERAN_LOGIN, PilihanPeranLogin } from './PilihanPeranLogin';

interface LoginPetugasFormViewProps {
  register: UseFormRegister<PetugasLoginFormValues>;
  errors: { username?: string; password?: string };
  onSubmit: FormEventHandler<HTMLFormElement>;
  isPending: boolean;
  errorMessage: string | null;
  /** Peran yang sedang dipilih. Orientasi saja — tidak dikirim ke backend. */
  peran: Role;
  onPilihPeran: (role: Role) => void;
}

/** Tampilan form masuk pengurus. Tanpa hook — lihat `LoginPetugasForm`. */
export function LoginPetugasFormView({
  register,
  errors,
  onSubmit,
  isPending,
  errorMessage,
  peran,
  onPilihPeran,
}: LoginPetugasFormViewProps) {
  const pilihan = PERAN_LOGIN.find((p) => p.role === peran) ?? PERAN_LOGIN[0];

  return (
    <AuthLayout title={pilihan.judul}>
      <PilihanPeranLogin dipilih={peran} onPilih={onPilihPeran} />

      <form onSubmit={onSubmit} className="mt-6 space-y-5">
        {errorMessage && <Alert tone="error">{errorMessage}</Alert>}

        <Input
          label="Username"
          className="h-[3.25rem] text-base"
          icon={<UserRound className="h-5 w-5" />}
          autoComplete="username"
          placeholder="Masukkan username"
          error={errors.username}
          {...register('username')}
        />
        <PasswordInput
          label="Password"
          className="h-[3.25rem] text-base"
          icon={<KeyRound className="h-5 w-5" />}
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password}
          {...register('password')}
        />

        <Button
          type="submit"
          size="lg"
          className="mt-1 h-[3.25rem] w-full bg-brand-700 text-base font-semibold hover:bg-brand-800 active:bg-brand-900"
          isLoading={isPending}
        >
          Masuk
        </Button>
      </form>
    </AuthLayout>
  );
}
