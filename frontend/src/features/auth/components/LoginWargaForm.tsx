import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { pesanError } from '@/lib/utils';
import { useLoginWarga } from '../hooks/use-auth';
import { useRedirectAfterLogin } from '../hooks/use-redirect-after-login';
import { wargaLoginSchema, type WargaLoginFormValues } from '../schemas';
import { DemoAccountsNote } from './DemoAccountsNote';
import { LoginWargaFormView } from './LoginWargaFormView';

/** Akun contoh yang ikut di-seed di data dummy backend (lihat backend/app/data/akun.py). */
const AKUN_DEMO = [
  <span key="aktif">
    Warga sudah aktif: NIK <b>3204120210750001</b> / PIN <b>112233</b>
  </span>,
  <span key="belum-aktif">
    Warga belum aktif: NIK <b>3204124205790001</b>, lahir <b>02-05-1979</b>
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
      catatanDemo={<DemoAccountsNote items={AKUN_DEMO} />}
    />
  );
}
