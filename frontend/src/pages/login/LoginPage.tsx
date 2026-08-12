import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { HelpCircle, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { env } from '@/config/env';
import { pesanError } from '@/lib/utils';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { useLoginWarga } from '@/features/auth/hooks/use-auth';
import {
  wargaLoginSchema,
  type WargaLoginFormValues,
} from '@/features/auth/schemas';
import { paths } from '@/routes/paths';
import { homePathForRole } from '@/routes/role-utils';

/**
 * Halaman masuk utama — form warga (NIK + PIN).
 * Tidak ada pemilih peran: pengurus punya halaman terpisah, dan peran dibaca
 * dari akun. Layar ini dioptimalkan untuk 350 KK warga, bukan belasan pengurus.
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLoginWarga();
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
    login.mutate(values, {
      onSuccess: (session) => {
        const from = (location.state as { from?: Location })?.from?.pathname;
        navigate(from ?? homePathForRole(session.user.role), { replace: true });
      },
    });
  });

  const errorMessage = pesanError(login.error, 'Gagal masuk. Coba lagi.');

  return (
    <AuthLayout title="Masuk" description="Masukkan NIK dan PIN Anda.">
      <form onSubmit={onSubmit} className="mt-6 space-y-6">
        {errorMessage && <Alert tone="error">{errorMessage}</Alert>}

        <div className="space-y-4">
          <Input
            label="NIK"
            className="h-12 text-base"
            inputMode="numeric"
            maxLength={16}
            autoComplete="username"
            placeholder="16 digit angka"
            error={errors.nik?.message}
            {...register('nik')}
          />
          <Input
            label="PIN"
            type="password"
            className="h-12 text-base tracking-widest"
            inputMode="numeric"
            maxLength={6}
            autoComplete="current-password"
            placeholder="••••••"
            error={errors.pin?.message}
            {...register('pin')}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          isLoading={login.isPending}
        >
          Masuk
        </Button>
      </form>

      <div className="mt-6 space-y-3 text-sm">
        <p className="text-slate-600">
          Baru pertama kali masuk?{' '}
          <Link
            to={paths.aktivasi}
            className="font-medium text-brand-700 underline underline-offset-2"
          >
            Aktifkan akun Anda
          </Link>
        </p>

        <button
          type="button"
          onClick={() => setBantuanTerbuka((v) => !v)}
          className="focus-ring inline-flex items-center gap-1.5 rounded text-slate-500 hover:text-slate-700"
        >
          <HelpCircle className="h-4 w-4" />
          Lupa PIN?
        </button>

        {bantuanTerbuka && (
          <Alert tone="info">
            PIN tidak bisa dikirim ulang lewat SMS atau email. Temui{' '}
            <b>Ketua RT</b> Anda dengan membawa KTP, minta PIN Anda direset.
            Setelah direset, aktifkan kembali akun Anda lewat menu{' '}
            <b>Aktifkan akun</b>.
          </Alert>
        )}
      </div>

      <div className="mt-8 border-t border-slate-100 pt-4">
        <Link
          to={paths.loginPetugas}
          className="text-sm text-slate-500 underline underline-offset-2 hover:text-slate-700"
        >
          Masuk sebagai pengurus padukuhan
        </Link>
      </div>

      {env.apiMode === 'mock' && (
        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          <div className="mb-1.5 flex items-center gap-1.5 font-medium text-slate-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Akun demo (mode mock)
          </div>
          <ul className="space-y-0.5">
            <li>
              Warga sudah aktif: NIK <b>3204120208790004</b> / PIN <b>112233</b>
            </li>
            <li>
              Warga belum aktif: NIK <b>3204120101600008</b>, lahir{' '}
              <b>01-01-1960</b>
            </li>
          </ul>
        </div>
      )}
    </AuthLayout>
  );
}
