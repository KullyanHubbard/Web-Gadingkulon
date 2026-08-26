import type { FormEventHandler } from 'react';
import type { UseFormRegister } from 'react-hook-form';
import { KeyRound, UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { paths } from '@/routes/paths';
import type { WargaLoginFormValues } from '../schemas';

interface LoginWargaFormViewProps {
  register: UseFormRegister<WargaLoginFormValues>;
  errors: { nik?: string; pin?: string };
  onSubmit: FormEventHandler<HTMLFormElement>;
  isPending: boolean;
  errorMessage: string | null;
  bantuanTerbuka: boolean;
  onToggleBantuan: () => void;
  ingatNik: boolean;
  onToggleIngatNik: () => void;
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
  ingatNik,
  onToggleIngatNik,
}: LoginWargaFormViewProps) {
  return (
    <AuthLayout title="Masuk sebagai warga">
      <form onSubmit={onSubmit} className="mt-6 space-y-5">
        {errorMessage && <Alert tone="error">{errorMessage}</Alert>}

        <div className="space-y-4">
          <Input
            label="NIK"
            className="h-12 text-base"
            icon={<UserRound className="h-4 w-4" />}
            inputMode="numeric"
            maxLength={16}
            autoComplete="username"
            placeholder="3204xxxxxxxxxxxx"
            error={errors.nik}
            {...register('nik')}
          />
          <PasswordInput
            label="PIN"
            className="h-12 text-base tracking-widest"
            icon={<KeyRound className="h-4 w-4" />}
            inputMode="numeric"
            maxLength={6}
            autoComplete="current-password"
            placeholder="••••••"
            error={errors.pin}
            {...register('pin')}
          />
        </div>

        <div className="flex items-center justify-between gap-4 text-sm">
          <label className="inline-flex cursor-pointer select-none items-center gap-2 text-slate-600">
            <input
              type="checkbox"
              checked={ingatNik}
              onChange={onToggleIngatNik}
              className="focus-ring h-4 w-4 cursor-pointer rounded border-1 border-slate-300 text-brand-600 accent-brand-600"
            />
            Ingat NIK saya
          </label>

          <button
            type="button"
            onClick={onToggleBantuan}
            className="focus-ring rounded font-semibold text-brand-700 hover:underline hover:underline-offset-2"
            aria-expanded={bantuanTerbuka}
          >
            Lupa PIN?
          </button>
        </div>

        {bantuanTerbuka && (
          <Alert tone="info">
            PIN tidak bisa dikirim ulang lewat SMS atau email. Temui{' '}
            <b>Ketua RT</b> Anda dengan membawa KTP, minta PIN Anda direset.
            Setelah direset, aktifkan kembali akun Anda lewat menu{' '}
            <b>Aktifkan akun</b>.
          </Alert>
        )}

        <Button
          type="submit"
          size="lg"
          className="w-full active:scale-[0.99]"
          isLoading={isPending}
        >
          Masuk
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Belum punya PIN?{' '}
        <Link
          to={paths.aktivasi}
          className="focus-ring rounded font-semibold text-brand-700 hover:underline hover:underline-offset-2"
        >
          Aktifkan akun Anda
        </Link>
      </p>

      {/* `border-t-1`, bukan `border-t`: borderWidth.DEFAULT di tailwind.config
          di-setel 4px, jadi garis telanjang setebal itu. */}
      <div className="mt-6 border-t border-slate-200 pt-4 text-center">
        <Link
          to={paths.loginPetugas}
          className="focus-ring rounded text-sm text-slate-700 underline underline-offset-2 hover:text-slate-900"
        >
          Masuk sebagai pengurus padukuhan
        </Link>
      </div>
    </AuthLayout>
  );
}
