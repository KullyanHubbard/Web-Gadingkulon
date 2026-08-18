import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { pesanError } from '@/lib/utils';
import { useLoginWarga } from '../hooks/use-auth';
import { useRedirectAfterLogin } from '../hooks/use-redirect-after-login';
import { getNikDiingat, simpanNikDiingat } from '../nik-tersimpan';
import { wargaLoginSchema, type WargaLoginFormValues } from '../schemas';
import { LoginWargaFormView } from './LoginWargaFormView';

/**
 * Logika masuk warga: validasi form, mutation, dan tujuan setelah berhasil.
 * Tampilannya sepenuhnya ada di `LoginWargaFormView`.
 */
export function LoginWargaForm() {
  const login = useLoginWarga();
  const redirectAfterLogin = useRedirectAfterLogin();
  const [bantuanTerbuka, setBantuanTerbuka] = useState(false);

  // Dibaca sekali saat mount: nilainya cuma dipakai sebagai isian awal, dan
  // membacanya ulang tiap render akan menimpa yang sedang diketik warga.
  const [nikAwal] = useState(getNikDiingat);
  const [ingatNik, setIngatNik] = useState(() => Boolean(nikAwal));

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WargaLoginFormValues>({
    resolver: zodResolver(wargaLoginSchema),
    defaultValues: { nik: nikAwal, pin: '' },
  });

  const onSubmit = handleSubmit((values) => {
    login.mutate(values, {
      onSuccess: (session) => {
        // Disimpan setelah backend menerimanya — NIK yang salah ketik tidak
        // pantas dihafal dan disodorkan lagi di kunjungan berikutnya.
        simpanNikDiingat(ingatNik ? values.nik : null);
        redirectAfterLogin(session);
      },
    });
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
      ingatNik={ingatNik}
      onToggleIngatNik={() => setIngatNik((v) => !v)}
    />
  );
}
