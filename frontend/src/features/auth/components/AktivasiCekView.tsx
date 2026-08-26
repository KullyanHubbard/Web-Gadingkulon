import type { FormEventHandler } from 'react';
import type { UseFormRegister } from 'react-hook-form';
import { UserRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { NAMA_BULAN } from '@/lib/tanggal';
import { cn } from '@/lib/utils';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { paths } from '@/routes/paths';
import type { AktivasiFormValues } from '../schemas';

interface AktivasiCekViewProps {
  register: UseFormRegister<AktivasiFormValues>;
  errors: { nik?: string; tanggalLahir?: string };
  onSubmit: FormEventHandler<HTMLFormElement>;
  isPending: boolean;
  errorMessage: string | null;
}

/** Aktivasi langkah 1 — cocokkan NIK dengan tanggal lahir. Tampilan saja. */
export function AktivasiCekView({
  register,
  errors,
  onSubmit,
  isPending,
  errorMessage,
}: AktivasiCekViewProps) {
  return (
    <AuthLayout title="Aktifkan akun">
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        {errorMessage && <Alert tone="error">{errorMessage}</Alert>}

        <Input
          label="NIK"
          className="h-12 text-base"
          icon={<UserRound className="h-4 w-4" />}
          inputMode="numeric"
          maxLength={16}
          placeholder="3204xxxxxxxxxxxx"
          error={errors.nik}
          {...register('nik')}
        />

        {/*
          Tiga kolom terpisah, bukan `<input type="date">`.

          Urutan kotak pada input tanggal bawaan ditentukan bahasa BROWSER, dan
          tidak bisa dipaksa dari kode — tidak lewat atribut, tidak lewat CSS,
          tidak lewat `lang`. Akibatnya "02/05/1979" terbaca 2 Mei di satu
          laptop dan 5 Februari di laptop sebelahnya, warga tidak punya cara
          tahu yang mana, dan backend cuma bisa menjawab "tidak cocok" —
          menyalahkan datanya, padahal yang meleset urutan ketiknya.

          Bulannya berupa NAMA, bukan angka. Itu bagian yang menyelesaikan
          masalahnya: "Mei" tidak bisa dibaca sebagai apa pun selain Mei.
        */}
        <fieldset>
          <legend className="mb-1.5 text-sm font-medium text-slate-700">
            Tanggal lahir
          </legend>

          <div className="grid grid-cols-[4.5rem_1fr_5.5rem] gap-2">
            <Input
              aria-label="Tanggal"
              className="h-12 text-center text-base"
              inputMode="numeric"
              maxLength={2}
              placeholder="Tgl"
              {...register('tanggal')}
            />

            <select
              aria-label="Bulan"
              defaultValue=""
              className={cn(
                'focus-ring h-12 w-full rounded-lg border-1 border-slate-300 bg-white px-3 text-base text-slate-900 transition-colors focus:border-brand-500',
                errors.tanggalLahir &&
                  'border-red-400 focus:border-red-500 focus-visible:ring-red-500',
              )}
              {...register('bulan')}
            >
              <option value="" disabled>
                Bulan
              </option>
              {NAMA_BULAN.map((nama, i) => (
                <option key={nama} value={String(i + 1).padStart(2, '0')}>
                  {nama}
                </option>
              ))}
            </select>

            <Input
              aria-label="Tahun"
              className="h-12 text-center text-base"
              inputMode="numeric"
              maxLength={4}
              placeholder="Tahun"
              {...register('tahun')}
            />
          </div>

          {errors.tanggalLahir && (
            <p className="mt-1 text-xs text-red-600">{errors.tanggalLahir}</p>
          )}
        </fieldset>

        <Button
          type="submit"
          size="lg"
          className="w-full active:scale-[0.99]"
          isLoading={isPending}
        >
          Lanjut
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Sudah punya PIN?{' '}
        <Link
          to={paths.login}
          className="focus-ring rounded font-semibold text-brand-700 hover:underline hover:underline-offset-2"
        >
          Masuk di sini
        </Link>
      </p>
    </AuthLayout>
  );
}
