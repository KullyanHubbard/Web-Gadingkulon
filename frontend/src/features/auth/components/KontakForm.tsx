import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { pesanError } from '@/lib/utils';
import { paths } from '@/routes/paths';
import { useAuth, useSimpanKontak } from '../hooks/use-auth';
import { kontakSchema, type KontakFormValues } from '../schemas';
import { KontakFormView } from './KontakFormView';

/**
 * Logika kontak warga — sepenuhnya OPSIONAL.
 *
 * Nomor HP & email di sini adalah data yang dikumpulkan padukuhan, BUKAN kunci
 * masuk: mengosongkannya tidak menghalangi warga mengakses datanya sendiri.
 */
export function KontakForm() {
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
    // String kosong berarti "tidak diisi", bukan "kosongkan jadi string kosong".
    simpan.mutate({ noHp: noHp || undefined, email: email || undefined });
  });

  return (
    <KontakFormView
      register={register}
      errors={{ noHp: errors.noHp?.message, email: errors.email?.message }}
      onSubmit={onSubmit}
      isPending={simpan.isPending}
      isSuccess={simpan.isSuccess && !simpan.isPending}
      errorMessage={pesanError(simpan.error, 'Gagal menyimpan. Coba lagi.')}
      onLewati={() => navigate(paths.beranda)}
    />
  );
}
