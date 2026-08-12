import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import type { Penduduk } from '../types';
import {
  agamaLabel,
  jenisKelaminLabel,
  pendidikanLabel,
  statusHubunganLabel,
  statusPerkawinanLabel,
} from '../labels';
import { formatTanggal, hitungUmur } from '../utils';

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-medium text-slate-800">{value}</dd>
    </div>
  );
}

/** Kartu detail lengkap satu penduduk. */
export function PendudukDetail({ penduduk }: { penduduk: Penduduk }) {
  const { alamat } = penduduk;
  return (
    <Card>
      <CardHeader
        title={penduduk.nama}
        description={`NIK ${penduduk.nik}`}
        action={
          <Badge tone="brand">
            {statusHubunganLabel[penduduk.statusHubunganKeluarga]}
          </Badge>
        }
      />
      <CardContent>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
          <Field label="No. KK" value={penduduk.noKK} />
          <Field
            label="Jenis Kelamin"
            value={jenisKelaminLabel[penduduk.jenisKelamin]}
          />
          <Field
            label="Tempat, Tgl Lahir"
            value={`${penduduk.tempatLahir}, ${formatTanggal(penduduk.tanggalLahir)}`}
          />
          <Field
            label="Umur"
            value={`${hitungUmur(penduduk.tanggalLahir)} tahun`}
          />
          <Field label="Agama" value={agamaLabel[penduduk.agama]} />
          <Field
            label="Status Perkawinan"
            value={statusPerkawinanLabel[penduduk.statusPerkawinan]}
          />
          <Field
            label="Pendidikan"
            value={pendidikanLabel[penduduk.pendidikan]}
          />
          <Field label="Pekerjaan" value={penduduk.pekerjaan} />
          <Field label="Gol. Darah" value={penduduk.golonganDarah} />
          <Field label="Kewarganegaraan" value={penduduk.kewarganegaraan} />
          <div className="col-span-2 sm:col-span-3">
            <dt className="text-xs uppercase tracking-wide text-slate-400">
              Alamat
            </dt>
            <dd className="mt-0.5 text-sm font-medium text-slate-800">
              {alamat.jalan}, RT {alamat.rt}/RW {alamat.rw}, Desa {alamat.desa},
              Kec. {alamat.kecamatan}, {alamat.kabupaten}, {alamat.provinsi}{' '}
              {alamat.kodePos}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
