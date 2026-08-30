import type { FieldErrors, UseFormRegister } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { NAMA_BULAN } from '@/lib/tanggal';
import {
  agamaLabel,
  golonganDarahLabel,
  jenisKelaminLabel,
  pendidikanLabel,
  statusHubunganLabel,
  statusKependudukanLabel,
  statusPerkawinanLabel,
} from '../labels';
import type { WargaFormValues } from '../schemas';

interface WargaFormFieldsProps {
  register: UseFormRegister<WargaFormValues>;
  errors: FieldErrors<WargaFormValues>;
  /** Tambah warga: status kependudukan disembunyikan (warga baru selalu AKTIF). */
  menambah: boolean;
  /** Hanya Dukuh yang boleh memindahkan warga antar-wilayah. */
  bolehPindahWilayah: boolean;
}

/**
 * Tiga kotak tanggal lahir, BUKAN `<input type="date">`: urutan kotak bawaan
 * browser (dd/mm vs mm/dd) ikut bahasanya dan tidak bisa dipaksa, jadi isian
 * bisa terbaca diam-diam sebagai tanggal lain.
 */
function TanggalLahir({
  register,
  errors,
}: Pick<WargaFormFieldsProps, 'register' | 'errors'>) {
  const galat =
    errors.tanggal?.message ?? errors.bulan?.message ?? errors.tahun?.message;

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        Tanggal Lahir
      </label>
      <div className="flex gap-2">
        <Input placeholder="Tgl" className="w-16" {...register('tanggal')} />
        <Select className="flex-1 px-2" {...register('bulan')}>
          <option value="">Bulan</option>
          {NAMA_BULAN.map((nama, i) => (
            <option key={nama} value={String(i + 1).padStart(2, '0')}>
              {nama}
            </option>
          ))}
        </Select>
        <Input placeholder="Tahun" className="w-20" {...register('tahun')} />
      </div>
      {galat && <p className="mt-1 text-xs text-red-600">{galat}</p>}
    </div>
  );
}

/** Kisi isian formulir data warga. Tampilan saja — tanpa state & tanpa mutasi. */
export function WargaFormFields({
  register,
  errors,
  menambah,
  bolehPindahWilayah,
}: WargaFormFieldsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Input
        label="Nama Lengkap"
        error={errors.nama?.message}
        {...register('nama')}
      />
      <Select
        label="Jenis Kelamin"
        pilihan={jenisKelaminLabel}
        error={errors.jenisKelamin?.message}
        {...register('jenisKelamin')}
      />
      <Input
        label="Tempat Lahir"
        error={errors.tempatLahir?.message}
        {...register('tempatLahir')}
      />

      <TanggalLahir register={register} errors={errors} />

      <Select
        label="Agama"
        pilihan={agamaLabel}
        error={errors.agama?.message}
        {...register('agama')}
      />
      <Select
        label="Status Perkawinan"
        pilihan={statusPerkawinanLabel}
        error={errors.statusPerkawinan?.message}
        {...register('statusPerkawinan')}
      />
      <Select
        label="Pendidikan"
        pilihan={pendidikanLabel}
        error={errors.pendidikan?.message}
        {...register('pendidikan')}
      />
      <Input
        label="Pekerjaan"
        error={errors.pekerjaan?.message}
        {...register('pekerjaan')}
      />
      <Select
        label="Gol. Darah"
        pilihan={golonganDarahLabel}
        error={errors.golonganDarah?.message}
        {...register('golonganDarah')}
      />
      <Select
        label="Status dalam Keluarga"
        pilihan={statusHubunganLabel}
        error={errors.statusHubunganKeluarga?.message}
        {...register('statusHubunganKeluarga')}
      />
      {/* Warga baru selalu AKTIF — pilihannya cuma relevan saat mengubah. */}
      {!menambah && (
        <Select
          label="Status Kependudukan"
          pilihan={statusKependudukanLabel}
          error={errors.statusKependudukan?.message}
          {...register('statusKependudukan')}
        />
      )}
      <Input
        label="Alamat Jalan"
        error={errors.jalan?.message}
        {...register('jalan')}
      />
      <Input
        label="RT"
        disabled={!bolehPindahWilayah}
        hint={
          bolehPindahWilayah
            ? undefined
            : 'Hanya Pak Dukuh yang bisa memindahkan warga.'
        }
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
  );
}
