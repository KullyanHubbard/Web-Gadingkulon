import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { pesanError } from '@/lib/utils';
import { useLoginPetugas } from '../hooks/use-auth';
import { useRedirectAfterLogin } from '../hooks/use-redirect-after-login';
import { petugasLoginSchema, type PetugasLoginFormValues } from '../schemas';
import { DemoAccountsNote } from './DemoAccountsNote';
import { LoginPetugasFormView } from './LoginPetugasFormView';

const AKUN_DEMO = [
  <span key="dukuh">
    Dukuh: <b>dukuh</b> / <b>dukuh123</b>
  </span>,
  <span key="rt03">
    Ketua RT 03: <b>rt03</b> / <b>rt123</b>
  </span>,
];

/** Logika masuk pengurus. Tampilannya ada di `LoginPetugasFormView`. */
export function LoginPetugasForm() {
  const login = useLoginPetugas();
  const redirectAfterLogin = useRedirectAfterLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PetugasLoginFormValues>({
    resolver: zodResolver(petugasLoginSchema),
    defaultValues: { username: '', password: '' },
  });

  const onSubmit = handleSubmit((values) => {
    login.mutate(values, { onSuccess: redirectAfterLogin });
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
      catatanDemo={<DemoAccountsNote items={AKUN_DEMO} />}
    />
  );
}
