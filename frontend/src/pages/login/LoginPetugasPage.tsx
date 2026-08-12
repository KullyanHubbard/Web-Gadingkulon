import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { env } from '@/config/env';
import { pesanError } from '@/lib/utils';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { useLoginPetugas } from '@/features/auth/hooks/use-auth';
import {
  petugasLoginSchema,
  type PetugasLoginFormValues,
} from '@/features/auth/schemas';
import { paths } from '@/routes/paths';
import { homePathForRole } from '@/routes/role-utils';

/** Masuk khusus pengurus padukuhan (Dukuh / RW / RT). */
export default function LoginPetugasPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLoginPetugas();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PetugasLoginFormValues>({
    resolver: zodResolver(petugasLoginSchema),
    defaultValues: { username: '', password: '' },
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
          error={errors.username?.message}
          {...register('username')}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password?.message}
          {...register('password')}
        />

        <Button type="submit" className="w-full" isLoading={login.isPending}>
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

      {env.apiMode === 'mock' && (
        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
          <div className="mb-1.5 flex items-center gap-1.5 font-medium text-slate-700">
            <ShieldCheck className="h-3.5 w-3.5" />
            Akun demo (mode mock)
          </div>
          <ul className="space-y-0.5">
            <li>
              Dukuh: <b>dukuh</b> / <b>dukuh123</b>
            </li>
            <li>
              Ketua RT 03: <b>rt03</b> / <b>rt123</b>
            </li>
          </ul>
        </div>
      )}
    </AuthLayout>
  );
}
