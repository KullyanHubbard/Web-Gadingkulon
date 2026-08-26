import type { FormEventHandler } from 'react';
import type { UseFormRegister } from 'react-hook-form';
import { KeyRound, UserRound } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import type { PetugasLoginFormValues } from '../schemas';

interface LoginPetugasFormViewProps {
  register: UseFormRegister<PetugasLoginFormValues>;
  errors: { username?: string; password?: string };
  onSubmit: FormEventHandler<HTMLFormElement>;
  isPending: boolean;
  errorMessage: string | null;
}

/** Tampilan form masuk pengurus. Tanpa hook — lihat `LoginPetugasForm`. */
export function LoginPetugasFormView({
  register,
  errors,
  onSubmit,
  isPending,
  errorMessage,
}: LoginPetugasFormViewProps) {
  return (
    <AuthLayout title="Masuk sebagai pengurus">
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {errorMessage && <Alert tone="error">{errorMessage}</Alert>}

        <Input
          label="Username"
          className="h-12 text-base"
          icon={<UserRound className="h-4 w-4" />}
          autoComplete="username"
          placeholder="cth. dukuh"
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
      </form>

    </AuthLayout>
  );
}
