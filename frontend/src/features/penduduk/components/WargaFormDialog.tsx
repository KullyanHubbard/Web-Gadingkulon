import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { dariTanggalLahirIso, keTanggalLahirIso } from '@/lib/tanggal';
import { pesanError } from '@/lib/utils';
import { useTambahPenduduk, useUbahPenduduk } from '../hooks/use-penduduk';
import { wargaSchema, type WargaFormValues } from '../schemas';
import type { Penduduk } from '../types';
import { WargaFormFields } from './WargaFormFields';

interface WargaFormDialogProps {
  /** `null` = tertutup. `'baru'` = tambah warga. Selain itu = ubah warga itu. */
  target: Penduduk | 'baru' | null;
  onClose: () => void;
}

const KOSONG: WargaFormValues = {
  nama: '',
  jenisKelamin: 'LAKI_LAKI',
  tempatLahir: '',
  tanggal: '',
  bulan: '',
  tahun: '',
  agama: 'ISLAM',
  statusPerkawinan: 'BELUM_KAWIN',
  pendidikan: 'SMA',
  pekerjaan: '',
  golonganDarah: 'TIDAK_TAHU',
  statusHubunganKeluarga: 'ANAK',
  statusKependudukan: 'AKTIF',
  jalan: '',
  rt: '',
  rw: '',
};

/**
 * Formulir data warga — dipakai untuk menambah maupun mengubah. Semua state &
 * mutasi ada di sini; isian kolomnya di `WargaFormFields`.
 *
 * Yang ditegakkan di sini, dan ditegakkan ulang backend: **RT/RW terkunci untuk
 * Ketua RT & RW.** Memindahkan warga antar-wilayah hanya kewenangan Dukuh —
 * kalau Ketua RT boleh, ia bisa memindahkan orang keluar dari wilayahnya
 * sendiri lalu tidak bisa lagi membatalkannya.
 */
export function WargaFormDialog({ target, onClose }: WargaFormDialogProps) {
  const { user } = useAuth();
  const tambah = useTambahPenduduk();
  const ubah = useUbahPenduduk();
  const menambah = target === 'baru';
  const warga = target === 'baru' || target === null ? null : target;

  const bolehPindahWilayah = user?.role === 'DUKUH';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<WargaFormValues>({ resolver: zodResolver(wargaSchema) });

  useEffect(() => {
    if (!target) return;
    if (warga) {
      const { tanggal, bulan, tahun } = dariTanggalLahirIso(warga.tanggalLahir);
      reset({
        ...warga,
        tanggal,
        bulan,
        tahun,
        jalan: warga.alamat.jalan,
        rt: warga.alamat.rt,
        rw: warga.alamat.rw,
      });
    } else {
      // Wilayah sendiri sebagai bawaan; Ketua RT/RW tidak bisa mengubahnya.
      reset({ ...KOSONG, rt: user?.rt ?? '', rw: user?.rw ?? '' });
    }
  }, [target, warga, reset, user]);

  const onSubmit = handleSubmit((v) => {
    const tanggalLahir = keTanggalLahirIso(v);
    if (!tanggalLahir) return;
    const inti = {
      nama: v.nama,
      jenisKelamin: v.jenisKelamin,
      tempatLahir: v.tempatLahir,
      tanggalLahir,
      agama: v.agama,
      statusPerkawinan: v.statusPerkawinan,
      pendidikan: v.pendidikan,
      pekerjaan: v.pekerjaan,
      golonganDarah: v.golonganDarah,
      statusHubunganKeluarga: v.statusHubunganKeluarga,
    };
    const alamat = { jalan: v.jalan, rt: v.rt, rw: v.rw };

    if (menambah) {
      tambah.mutate(
        {
          // `statusKependudukan` tidak dikirim: warga baru selalu AKTIF, dan
          // menawarkan pilihan lain di sini cuma mengundang salah isi.
          ...inti,
          kewarganegaraan: 'WNI',
          alamat: {
            ...alamat,
            desa: '',
            kecamatan: '',
            kabupaten: '',
            provinsi: '',
            kodePos: '',
          },
        },
        { onSuccess: onClose },
      );
      return;
    }
    if (!warga) return;
    ubah.mutate(
      {
        id: warga.id,
        payload: {
          ...inti,
          statusKependudukan: v.statusKependudukan,
          // RT/RW hanya ikut dikirim kalau memang boleh diubah — kalau tidak,
          // backend menolak seluruh permintaannya walau nilainya sama.
          alamat: bolehPindahWilayah ? alamat : { jalan: v.jalan },
        },
      },
      { onSuccess: onClose },
    );
  });

  const galat = pesanError(
    tambah.error ?? ubah.error,
    'Gagal menyimpan data warga.',
  );

  return (
    <Modal
      open={Boolean(target)}
      onClose={onClose}
      title={menambah ? 'Tambah Warga' : `Ubah Data ${warga?.nama ?? ''}`}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {!menambah && (
          <p className="text-xs text-slate-500">Kode Warga {warga?.id}</p>
        )}

        <WargaFormFields
          register={register}
          errors={errors}
          menambah={menambah}
          bolehPindahWilayah={bolehPindahWilayah}
        />

        {galat && <Alert tone="error">{galat}</Alert>}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" isLoading={tambah.isPending || ubah.isPending}>
            {menambah ? 'Tambah Warga' : 'Simpan Perubahan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
