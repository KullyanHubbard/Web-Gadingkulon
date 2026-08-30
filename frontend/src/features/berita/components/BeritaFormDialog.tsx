import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { pesanError } from '@/lib/utils';
import { useSimpanBerita } from '../hooks/use-berita';
import { beritaSchema, type BeritaFormValues } from '../schemas';
import type { Berita } from '../types';

interface BeritaFormDialogProps {
  /** `null` = tertutup. `'baru'` = tulis berita. Selain itu = sunting berita itu. */
  target: Berita | 'baru' | null;
  onClose: () => void;
}

/**
 * Batas ukuran foto utama.
 *
 * Bukan sekadar sopan santun: berita disimpan di `localStorage` yang kuotanya
 * ±5 MB per domain, dan data URL membengkak ±33% dari berkas aslinya. Satu foto
 * kamera ponsel 4 MB sudah cukup untuk membuat penyimpanan gagal DIAM-DIAM,
 * yang artinya berita hilang tanpa pesan.
 */
const MAKS_FOTO_BYTE = 600_000;

const KOSONG: BeritaFormValues = {
  judul: '',
  penulis: '',
  tanggalTerbit: new Date().toISOString().slice(0, 10),
  isi: '',
  foto: '',
};

/** Berkas gambar -> data URL, supaya bisa ikut masuk `localStorage`. */
function bacaSebagaiDataUrl(berkas: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const pembaca = new FileReader();
    pembaca.onload = () => resolve(String(pembaca.result));
    pembaca.onerror = () => reject(new Error('Foto gagal dibaca.'));
    pembaca.readAsDataURL(berkas);
  });
}

/** Formulir berita — dipakai untuk menulis baru maupun menyunting. */
export function BeritaFormDialog({ target, onClose }: BeritaFormDialogProps) {
  const simpan = useSimpanBerita();
  const [errorFoto, setErrorFoto] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BeritaFormValues>({
    resolver: zodResolver(beritaSchema),
    defaultValues: KOSONG,
  });

  const foto = watch('foto');

  // Isi ulang tiap kali dialog dibuka: satu instance form melayani semua
  // berita, jadi tanpa ini isian berita sebelumnya masih tertinggal.
  useEffect(() => {
    if (target === null) return;
    setErrorFoto(null);
    simpan.reset();
    reset(
      target === 'baru'
        ? KOSONG
        : {
            judul: target.judul,
            penulis: target.penulis,
            tanggalTerbit: target.tanggalTerbit,
            isi: target.isi,
            foto: target.foto,
          },
    );
    // `simpan` sengaja tidak jadi dependensi: objek mutasinya berganti identitas
    // tiap render, dan mengikutkannya mengosongkan form saat sedang diketik.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, reset]);

  const onPilihFoto = async (berkas: File | undefined) => {
    if (!berkas) return;
    if (berkas.size > MAKS_FOTO_BYTE) {
      setErrorFoto(
        `Foto terlalu besar (maksimal ${Math.round(MAKS_FOTO_BYTE / 1000)} KB). Perkecil dulu sebelum diunggah.`,
      );
      return;
    }
    setErrorFoto(null);
    setValue('foto', await bacaSebagaiDataUrl(berkas), { shouldDirty: true });
  };

  const onSubmit = handleSubmit(async (nilai) => {
    await simpan.mutateAsync({
      input: nilai,
      id: target === 'baru' || target === null ? undefined : target.id,
    });
    onClose();
  });

  return (
    <Modal
      open={target !== null}
      onClose={onClose}
      title={target === 'baru' ? 'Tulis Berita' : 'Sunting Berita'}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {simpan.isError && (
          <Alert tone="error">
            {pesanError(simpan.error, 'Berita gagal disimpan.')}
          </Alert>
        )}

        <Input
          label="Judul"
          error={errors.judul?.message}
          {...register('judul')}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Nama Penulis"
            error={errors.penulis?.message}
            {...register('penulis')}
          />
          <Input
            label="Tanggal Terbit"
            type="date"
            error={errors.tanggalTerbit?.message}
            {...register('tanggalTerbit')}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Foto Utama
          </label>
          {foto && (
            <div className="mb-2 flex items-center gap-3">
              <img
                src={foto}
                alt="Pratinjau foto utama"
                className="h-20 w-32 rounded-lg object-cover"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setValue('foto', '', { shouldDirty: true })}
              >
                Hapus foto
              </Button>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => void onPilihFoto(e.target.files?.[0])}
            className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100"
          />
          {errorFoto ? (
            <p className="mt-1 text-xs text-red-600">{errorFoto}</p>
          ) : (
            <p className="mt-1 text-xs text-slate-500">
              Opsional. JPG/PNG, maksimal {Math.round(MAKS_FOTO_BYTE / 1000)}{' '}
              KB.
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="isi"
            className="mb-1.5 block text-sm font-medium text-slate-700"
          >
            Isi Berita
          </label>
          <textarea
            id="isi"
            rows={10}
            className="focus-ring w-full rounded-lg border-1 border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-600"
            placeholder="Tulis isi berita. Pisahkan paragraf dengan satu baris kosong."
            {...register('isi')}
          />
          {errors.isi && (
            <p className="mt-1 text-xs text-red-600">{errors.isi.message}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" isLoading={simpan.isPending}>
            Simpan
          </Button>
        </div>
      </form>
    </Modal>
  );
}
