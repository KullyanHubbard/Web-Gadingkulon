import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { pesanError } from '@/lib/utils';
import { useLoginPetugas } from '../hooks/use-auth';
import { useRedirectAfterLogin } from '../hooks/use-redirect-after-login';
import { petugasLoginSchema, type PetugasLoginFormValues } from '../schemas';
import type { Role } from '../types';
import { LoginPetugasFormView } from './LoginPetugasFormView';

/** Logika masuk pengurus. Tampilannya ada di `LoginPetugasFormView`. */
export function LoginPetugasForm() {
  const login = useLoginPetugas();
  const redirectAfterLogin = useRedirectAfterLogin();
  // Orientasi saja: tidak ikut dikirim, dan backend tidak memeriksanya.
  const [peran, setPeran] = useState<Role>('DUKUH');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PetugasLoginFormValues>({
    resolver: zodResolver(petugasLoginSchema),
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = handleSubmit((values) => {
    login.mutate(
      { credentials: values, expectedRole: peran },
      { onSuccess: redirectAfterLogin },
    );
  });

  return (
    <LoginPetugasFormView
      register={register}
      errors={{
        username: errors.username?.message,
        password: errors.password?.message,
      }}
      onSubmit={onSubmit}
      isPending={login.isPending}
      errorMessage={pesanError(login.error, 'Gagal masuk. Coba lagi.')}
      peran={peran}
      onPilihPeran={setPeran}
    />
  );
}
