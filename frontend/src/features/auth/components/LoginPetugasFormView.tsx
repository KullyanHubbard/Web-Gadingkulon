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
    <AuthLayout title={pilihan.judul} description={pilihan.catatan}>
      <PilihanPeranLogin dipilih={peran} onPilih={onPilihPeran} />

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        {errorMessage && <Alert tone="error">{errorMessage}</Alert>}

        <Input
          label="Username"
          className="h-12 text-base"
          icon={<UserRound className="h-4 w-4" />}
          autoComplete="username"
          placeholder={`cth. ${pilihan.contoh}`}
          error={errors.username}
          {...register('username')}
        />
        <PasswordInput
          label="Password"
          className="h-12 text-base"
          icon={<KeyRound className="h-4 w-4" />}
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password}
          {...register('password')}
        />

        <Button
          type="submit"
          size="lg"
          className="w-full active:scale-[0.99]"
          isLoading={isPending}
        >
          Masuk
        </Button>

        <p className="text-center text-xs text-slate-500">
          Salah pilih peran tidak masalah — yang menentukan adalah akun Anda,
          bukan tombol di atas.
        </p>
      </form>

    </AuthLayout>
  );
}
