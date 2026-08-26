import type { FormEventHandler } from 'react';
import type { UseFormRegister } from 'react-hook-form';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { PasswordInput } from '@/components/ui/PasswordInput';
import type { PengurusBaruFormValues } from '../schemas';

interface PengurusFormViewProps {
  register: UseFormRegister<PengurusBaruFormValues>;
  errors: Partial<Record<keyof PengurusBaruFormValues, string>>;
  onSubmit: FormEventHandler<HTMLFormElement>;
  isPending: boolean;
  errorMessage?: string;
  suksesMessage?: string;
}

/** Form tambah akun pengurus. Tampilan saja. */
export function PengurusFormView({
  register,
  errors,
  onSubmit,
  isPending,
  errorMessage,
  suksesMessage,
}: PengurusFormViewProps) {
  return (
    <Card>
      <CardHeader
        title="Tambah Akun Pengurus"
        description="Jabatan dihitung otomatis dari RW & RT yang diisi: kosong keduanya = Dukuh."
      />
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Nama Lengkap"
              error={errors.nama}
              {...register('nama')}
            />
            <Input
              label="Username"
              autoComplete="off"
              error={errors.username}
              {...register('username')}
            />
            <PasswordInput
              label="Password"
              autoComplete="new-password"
              hint="Minimal 8 karakter. Beri tahu pemiliknya secara langsung."
              error={errors.password}
              {...register('password')}
            />
            <div>
              <label
                htmlFor="role"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Peran
              </label>
              <select
                id="role"
                className="focus-ring h-10 w-full rounded-lg border-1 border-slate-300 bg-white px-3 text-sm text-slate-900"
                {...register('role')}
              >
                <option value="PENGURUS">Pengurus (RW / RT)</option>
                <option value="ADMIN">Dukuh (bisa kelola akun)</option>
              </select>
            </div>
            <Input
              label="RW"
              placeholder="mis. 019 — kosongkan untuk Dukuh"
              error={errors.rw}
              {...register('rw')}
            />
            <Input
              label="RT"
              placeholder="mis. 03 — kosongkan untuk Ketua RW"
              error={errors.rt}
              {...register('rt')}
            />
          </div>

          {errorMessage && <Alert tone="error">{errorMessage}</Alert>}
          {suksesMessage && <Alert tone="success">{suksesMessage}</Alert>}

          <Button type="submit" isLoading={isPending}>
            Tambah Akun
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
