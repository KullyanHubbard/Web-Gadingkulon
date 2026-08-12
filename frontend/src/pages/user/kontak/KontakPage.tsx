import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Alert } from '@/components/ui/Alert';
import { pesanError } from '@/lib/utils';
import { useAuth, useSimpanKontak } from '@/features/auth/hooks/use-auth';
import { kontakSchema, type KontakFormValues } from '@/features/auth/schemas';
import { paths } from '@/routes/paths';

/**
 * Kontak warga — sepenuhnya OPSIONAL.
 *
 * Nomor HP & email di sini adalah data yang dikumpulkan padukuhan, BUKAN kunci
 * masuk: mengosongkannya tidak menghalangi warga mengakses datanya sendiri.
 */
export default function KontakPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const simpan = useSimpanKontak();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<KontakFormValues>({
    resolver: zodResolver(kontakSchema),
    defaultValues: { noHp: user?.noHp ?? '', email: user?.email ?? '' },
  });

  const onSubmit = handleSubmit(({ noHp, email }) => {
    simpan.mutate({ noHp: noHp || undefined, email: email || undefined });
  });

  const errorMessage = pesanError(simpan.error, 'Gagal menyimpan. Coba lagi.');

  return (
    <div>
      <PageHeader
        title="Kontak Saya"
        description="Agar pengurus padukuhan bisa menghubungi Anda bila ada informasi penting."
      />

      <Card className="max-w-lg">
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            {errorMessage && <Alert tone="error">{errorMessage}</Alert>}
            {simpan.isSuccess && !simpan.isPending && (
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
              error={errors.noHp?.message}
              {...register('noHp')}
            />
            <Input
              label="Email (opsional)"
              type="email"
              className="h-12 text-base"
              autoComplete="email"
              placeholder="nama@gmail.com"
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="flex gap-2">
              <Button type="submit" isLoading={simpan.isPending}>
                Simpan
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={() => navigate(paths.beranda)}
              >
                Lewati
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
