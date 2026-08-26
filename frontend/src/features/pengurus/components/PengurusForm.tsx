import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { pesanError } from '@/lib/utils';
import { useTambahPengurus } from '../hooks/use-pengurus';
import {
  pengurusBaruSchema,
  type PengurusBaruFormValues,
} from '../schemas';
import { PengurusFormView } from './PengurusFormView';

/** Logika tambah akun pengurus. Tampilannya ada di `PengurusFormView`. */
export function PengurusForm() {
  const tambah = useTambahPengurus();
  const [sukses, setSukses] = useState<string>();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PengurusBaruFormValues>({
    resolver: zodResolver(pengurusBaruSchema),
    defaultValues: {
      username: '',
      password: '',
      nama: '',
      role: 'PENGURUS',
      rw: '',
      rt: '',
    },
  });

  const onSubmit = handleSubmit((values) => {
    setSukses(undefined);
    tambah.mutate(values, {
      onSuccess: (akun) => {
        setSukses(`Akun ${akun.username} (${akun.jabatan}) berhasil dibuat.`);
        reset();
      },
    });
  });

  return (
    <PengurusFormView
      register={register}
      errors={{
        username: errors.username?.message,
        password: errors.password?.message,
        nama: errors.nama?.message,
        role: errors.role?.message,
        rw: errors.rw?.message,
        rt: errors.rt?.message,
      }}
      onSubmit={onSubmit}
      isPending={tambah.isPending}
      errorMessage={pesanError(tambah.error, 'Gagal menambah akun.') ?? undefined}
      suksesMessage={sukses}
    />
  );
}
