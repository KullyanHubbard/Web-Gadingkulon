import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import type { FilterOpsi, FilterPenduduk } from '../types';
import {
  agamaLabel,
  golonganDarahLabel,
  jenisKelaminLabel,
  kelompokUmurOpsi,
  pendidikanLabel,
  statusHubunganLabel,
  statusPerkawinanLabel,
} from '../labels';

/** Satu pilihan dropdown: nilai yang dikirim ke API + teks yang dibaca orang. */
type Opsi = readonly [nilai: string, teks: string];

interface FilterPendudukBarProps {
  value: FilterPenduduk;
  /** Pilihan non-enum dari data (RT/RW/pekerjaan). `undefined` selagi dimuat. */
  opsi: FilterOpsi | undefined;
  onChange: (next: FilterPenduduk) => void;
}

function dariLabel(map: Record<string, string>): Opsi[] {
  return Object.entries(map);
}

function dariData(nilai: string[] | undefined): Opsi[] {
  return (nilai ?? []).map((v) => [v, v] as Opsi);
}

function Pilihan({
  label,
  nilai,
  opsi,
  onPilih,
}: {
  label: string;
  nilai: string | undefined;
  opsi: Opsi[];
  onPilih: (v: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1 text-xs">
      <span className="font-medium text-slate-500">{label}</span>
      <select
        className={cn(
          'rounded-md border bg-surface px-2 py-1.5 text-sm text-slate-800',
          nilai ? 'border-slate-900 font-medium' : 'border-slate-300',
        )}
        value={nilai ?? ''}
        onChange={(e) => onPilih(e.target.value)}
      >
        <option value="">Semua</option>
        {opsi.map(([v, teks]) => (
          <option key={v} value={v}>
            {teks}
          </option>
        ))}
      </select>
    </label>
  );
}

/**
 * Baris filter daftar penduduk. Semua filter digabung AND oleh backend.
 *
 * Menggantikan pencarian NIK/No. KK yang hilang bersama dua kolom itu: yang
 * dicari pengurus sekarang selalu sekelompok orang, bukan satu nomor.
 */
export function FilterPendudukBar({
  value,
  opsi,
  onChange,
}: FilterPendudukBarProps) {
  /**
   * Nilai kosong dibuang dari objek, bukan disimpan sebagai `''` — kalau tidak,
   * query key React Query berbeda hanya karena ada field bernilai kosong, dan
   * cache-nya pecah tanpa alasan.
   */
  const set = (field: keyof FilterPenduduk) => (v: string) => {
    const next = { ...value };
    if (v) {
      // Nilai <select> selalu `string`; union sempitnya dijaga oleh daftar
      // pilihan yang dibangkitkan dari `labels`/`opsi`, bukan input bebas.
      next[field] = v as never;
    } else {
      delete next[field];
    }
    onChange(next);
  };

  const jumlahAktif = Object.keys(value).length;

  return (
    <div className="flex flex-wrap items-end gap-3">
      <Pilihan
        label="Jenis Kelamin"
        nilai={value.jenisKelamin}
        opsi={dariLabel(jenisKelaminLabel)}
        onPilih={set('jenisKelamin')}
      />
      <Pilihan
        label="Agama"
        nilai={value.agama}
        opsi={dariLabel(agamaLabel)}
        onPilih={set('agama')}
      />
      <Pilihan
        label="Gol. Darah"
        nilai={value.golonganDarah}
        opsi={dariLabel(golonganDarahLabel)}
        onPilih={set('golonganDarah')}
      />
      <Pilihan
        label="Pendidikan"
        nilai={value.pendidikan}
        opsi={dariLabel(pendidikanLabel)}
        onPilih={set('pendidikan')}
      />
      <Pilihan
        label="Status Perkawinan"
        nilai={value.statusPerkawinan}
        opsi={dariLabel(statusPerkawinanLabel)}
        onPilih={set('statusPerkawinan')}
      />
      <Pilihan
        label="Status dalam Keluarga"
        nilai={value.statusHubunganKeluarga}
        opsi={dariLabel(statusHubunganLabel)}
        onPilih={set('statusHubunganKeluarga')}
      />
      <Pilihan
        label="Kelompok Umur"
        nilai={value.kelompokUmur}
        opsi={kelompokUmurOpsi.map((u) => [u, `${u} th`] as Opsi)}
        onPilih={set('kelompokUmur')}
      />
      <Pilihan
        label="RW"
        nilai={value.rw}
        opsi={dariData(opsi?.rw)}
        onPilih={set('rw')}
      />
      <Pilihan
        label="RT"
        nilai={value.rt}
        opsi={dariData(opsi?.rt)}
        onPilih={set('rt')}
      />
      <Pilihan
        label="Pekerjaan"
        nilai={value.pekerjaan}
        opsi={dariData(opsi?.pekerjaan)}
        onPilih={set('pekerjaan')}
      />
      {jumlahAktif > 0 && (
        <Button size="sm" variant="ghost" onClick={() => onChange({})}>
          Hapus {jumlahAktif} filter
        </Button>
      )}
    </div>
  );
}
