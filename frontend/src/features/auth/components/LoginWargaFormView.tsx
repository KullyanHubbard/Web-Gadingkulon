import type { FormEventHandler, ReactNode } from 'react';
import type { UseFormRegister } from 'react-hook-form';
import { HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { paths } from '@/routes/paths';
import type { WargaLoginFormValues } from '../schemas';
import { AuthLayout } from './AuthLayout';

interface LoginWargaFormViewProps {
  register: UseFormRegister<WargaLoginFormValues>;
  errors: { nik?: string; pin?: string };
  onSubmit: FormEventHandler<HTMLFormElement>;
  isPending: boolean;
  errorMessage: string | null;
  bantuanTerbuka: boolean;
  onToggleBantuan: () => void;
  /** Catatan akun demo — hanya diisi container saat mode mock. */
  catatanDemo?: ReactNode;
}

/**
 * Tampilan form masuk warga (NIK + PIN).
 *
 * Tanpa hook, tanpa akses data: seluruh state & mutation ada di
 * `LoginWargaForm`. File ini bisa dibaca dan diubah tampilannya tanpa perlu
 * tahu bagaimana proses masuk bekerja.
 */
export function LoginWargaFormView({
  register,
  errors,
  onSubmit,
  isPending,
  errorMessage,
  bantuanTerbuka,
  onToggleBantuan,
  catatanDemo,
}: LoginWargaFormViewProps) {
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
            error={errors.nik}
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
            error={errors.pin}
            {...register('pin')}
          />
        </div>

        <Button
          type="submit"
          size="lg"
          className="w-full"
          isLoading={isPending}
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
          onClick={onToggleBantuan}
          className="focus-ring inline-flex items-center gap-1.5 rounded text-slate-500 hover:text-slate-700"
          aria-expanded={bantuanTerbuka}
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

      {catatanDemo}
    </AuthLayout>
  );
}
