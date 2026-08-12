import type { FormEventHandler } from 'react';
import type { UseFormRegister } from 'react-hook-form';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import type { KontakFormValues } from '../schemas';

interface KontakFormViewProps {
  register: UseFormRegister<KontakFormValues>;
  errors: { noHp?: string; email?: string };
  onSubmit: FormEventHandler<HTMLFormElement>;
  isPending: boolean;
  isSuccess: boolean;
  errorMessage: string | null;
  onLewati: () => void;
}

/** Tampilan form kontak opsional warga. Tanpa hook — lihat `KontakForm`. */
export function KontakFormView({
  register,
  errors,
  onSubmit,
  isPending,
  isSuccess,
  errorMessage,
  onLewati,
}: KontakFormViewProps) {
  return (
    <Card className="max-w-lg">
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {errorMessage && <Alert tone="error">{errorMessage}</Alert>}
          {isSuccess && (
            <Alert tone="success">Kontak Anda sudah tersimpan.</Alert>
          )}

          <Alert tone="info">
            Bagian ini boleh dikosongkan. Nomor HP dan email <b>tidak</b>{' '}
            dipakai untuk masuk — Anda tetap masuk dengan NIK dan PIN.
          </Alert>

          <Input
            label="Nomor HP (opsional)"
            className="h-12 text-base"
            inputMode="tel"
            autoComplete="tel"
            placeholder="081234567890"
            error={errors.noHp}
            {...register('noHp')}
          />
          <Input
            label="Email (opsional)"
            type="email"
            className="h-12 text-base"
            autoComplete="email"
            placeholder="nama@gmail.com"
            error={errors.email}
            {...register('email')}
          />

          <div className="flex gap-2">
            <Button type="submit" isLoading={isPending}>
              Simpan
            </Button>
            <Button type="button" variant="ghost" onClick={onLewati}>
              Lewati
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
