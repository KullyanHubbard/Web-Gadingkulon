import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/features/auth/hooks/use-auth';
import {
  dariTanggalLahirIso,
  keTanggalLahirIso,
  NAMA_BULAN,
} from '@/lib/tanggal';
import { pesanError } from '@/lib/utils';
import type { Penduduk } from '@/types/penduduk';
import {
  agamaLabel,
  golonganDarahLabel,
  jenisKelaminLabel,
  pendidikanLabel,
  statusHubunganLabel,
  statusKependudukanLabel,
  statusPerkawinanLabel,
} from '../labels';
import { useTambahPenduduk, useUbahPenduduk } from '../hooks/use-penduduk';
import { wargaSchema, type WargaFormValues } from '../schemas';

interface WargaFormDialogProps {
  /** `null` = tertutup. `'baru'` = tambah warga. Selain itu = ubah warga itu. */
  target: Penduduk | 'baru' | null;
  onClose: () => void;
}

/** <select> terikat react-hook-form, dengan pilihan dari peta label. */
function Pilihan({
  label,
  error,
  pilihan,
  disabled,
  ...rest
}: {
  label: string;
  error?: string;
  pilihan: Record<string, string>;
  disabled?: boolean;
} & ReturnType<ReturnType<typeof useForm<WargaFormValues>>['register']>) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <select
        disabled={disabled}
        className="focus-ring h-10 w-full rounded-lg border-1 border-slate-300 bg-white px-3 text-sm text-slate-900 disabled:bg-slate-100 disabled:text-slate-500"
        {...rest}
      >
        {Object.entries(pilihan).map(([nilai, teks]) => (
          <option key={nilai} value={nilai}>
            {teks}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

/**
 * Formulir data warga — dipakai untuk menambah maupun mengubah.
 *
 * Dua hal yang ditegakkan di sini, dan dua-duanya ditegakkan ulang backend:
 *
 * 1. **RT/RW terkunci untuk Ketua RT & RW.** Memindahkan warga antar-wilayah
 *    hanya kewenangan Dukuh — kalau Ketua RT boleh, ia bisa memindahkan orang
 *    keluar dari wilayahnya sendiri lalu tidak bisa lagi membatalkannya.
 * 2. **Tanggal lahir tiga kotak**, bukan `<input type="date">`: urutan kotak
 *    bawaan browser tidak bisa dipaksa dd/mm/yyyy.
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
      reset({
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
        // Wilayah sendiri sebagai bawaan; Ketua RT/RW tidak bisa mengubahnya.
        rt: user?.rt ?? '',
        rw: user?.rw ?? '',
      });
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
          alamat: bolehPindahWilayah
            ? alamat
            : { jalan: v.jalan },
        },
      },
      { onSuccess: onClose },
    );
  });

  const sedangKirim = tambah.isPending || ubah.isPending;
  const galat = pesanError(
    tambah.error ?? ubah.error,
    'Gagal menyimpan data warga.',
  );

  return (
    <Modal
      open={Boolean(target)}
      onClose={onClose}
      title={menambah ? 'Tambah Warga' : `Ubah Data — ${warga?.nama ?? ''}`}
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {!menambah && (
          <p className="text-xs text-slate-500">Kode Warga {warga?.id}</p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Nama Lengkap" error={errors.nama?.message} {...register('nama')} />
          <Pilihan label="Jenis Kelamin" pilihan={jenisKelaminLabel} error={errors.jenisKelamin?.message} {...register('jenisKelamin')} />
          <Input label="Tempat Lahir" error={errors.tempatLahir?.message} {...register('tempatLahir')} />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Tanggal Lahir
            </label>
            <div className="flex gap-2">
              <Input placeholder="Tgl" className="w-16" {...register('tanggal')} />
              <select
                className="focus-ring h-10 flex-1 rounded-lg border-1 border-slate-300 bg-white px-2 text-sm"
                {...register('bulan')}
              >
                <option value="">Bulan</option>
                {NAMA_BULAN.map((nama, i) => (
                  <option key={nama} value={String(i + 1).padStart(2, '0')}>
                    {nama}
                  </option>
                ))}
              </select>
              <Input placeholder="Tahun" className="w-20" {...register('tahun')} />
            </div>
            {(errors.tanggal || errors.bulan || errors.tahun) && (
              <p className="mt-1 text-xs text-red-600">
                {errors.tanggal?.message ??
                  errors.bulan?.message ??
                  errors.tahun?.message}
              </p>
            )}
          </div>

          <Pilihan label="Agama" pilihan={agamaLabel} error={errors.agama?.message} {...register('agama')} />
          <Pilihan label="Status Perkawinan" pilihan={statusPerkawinanLabel} error={errors.statusPerkawinan?.message} {...register('statusPerkawinan')} />
          <Pilihan label="Pendidikan" pilihan={pendidikanLabel} error={errors.pendidikan?.message} {...register('pendidikan')} />
          <Input label="Pekerjaan" error={errors.pekerjaan?.message} {...register('pekerjaan')} />
          <Pilihan label="Gol. Darah" pilihan={golonganDarahLabel} error={errors.golonganDarah?.message} {...register('golonganDarah')} />
          <Pilihan label="Status dalam Keluarga" pilihan={statusHubunganLabel} error={errors.statusHubunganKeluarga?.message} {...register('statusHubunganKeluarga')} />
          {/* Warga baru selalu AKTIF — pilihannya cuma relevan saat mengubah. */}
          {!menambah && (
            <Pilihan label="Status Kependudukan" pilihan={statusKependudukanLabel} error={errors.statusKependudukan?.message} {...register('statusKependudukan')} />
          )}
          <Input label="Alamat Jalan" error={errors.jalan?.message} {...register('jalan')} />
          <Input
            label="RT"
            disabled={!bolehPindahWilayah}
            hint={bolehPindahWilayah ? undefined : 'Hanya Pak Dukuh yang bisa memindahkan warga.'}
            error={errors.rt?.message}
            {...register('rt')}
          />
          <Input
            label="RW"
            disabled={!bolehPindahWilayah}
            error={errors.rw?.message}
            {...register('rw')}
          />
        </div>

        {galat && <Alert tone="error">{galat}</Alert>}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" isLoading={sedangKirim}>
            {menambah ? 'Tambah Warga' : 'Simpan Perubahan'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
