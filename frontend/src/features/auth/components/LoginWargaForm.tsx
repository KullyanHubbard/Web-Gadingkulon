import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { env } from '@/config/env';
import { pesanError } from '@/lib/utils';
import { useLoginWarga } from '../hooks/use-auth';
import { useRedirectAfterLogin } from '../hooks/use-redirect-after-login';
import { wargaLoginSchema, type WargaLoginFormValues } from '../schemas';
import { DemoAccountsNote } from './DemoAccountsNote';
import { LoginWargaFormView } from './LoginWargaFormView';

/** Akun contoh yang ikut ditanam di data mock (lihat `src/mocks/data`). */
const AKUN_DEMO = [
  <span key="aktif">
    Warga sudah aktif: NIK <b>3204120208790004</b> / PIN <b>112233</b>
  </span>,
  <span key="belum-aktif">
    Warga belum aktif: NIK <b>3204120101600008</b>, lahir <b>01-01-1960</b>
  </span>,
];

/**
 * Logika masuk warga: validasi form, mutation, dan tujuan setelah berhasil.
 * Tampilannya sepenuhnya ada di `LoginWargaFormView`.
 */
export function LoginWargaForm() {
  const login = useLoginWarga();
  const redirectAfterLogin = useRedirectAfterLogin();
  const [bantuanTerbuka, setBantuanTerbuka] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WargaLoginFormValues>({
    resolver: zodResolver(wargaLoginSchema),
    defaultValues: { nik: '', pin: '' },
  });

  const onSubmit = handleSubmit((values) => {
    login.mutate(values, { onSuccess: redirectAfterLogin });
  });

  return (
    <LoginWargaFormView
      register={register}
      errors={{ nik: errors.nik?.message, pin: errors.pin?.message }}
      onSubmit={onSubmit}
      isPending={login.isPending}
      errorMessage={pesanError(login.error, 'Gagal masuk. Coba lagi.')}
      bantuanTerbuka={bantuanTerbuka}
      onToggleBantuan={() => setBantuanTerbuka((v) => !v)}
      catatanDemo={
        env.apiMode === 'mock' ? <DemoAccountsNote items={AKUN_DEMO} /> : null
      }
    />
  );
}
