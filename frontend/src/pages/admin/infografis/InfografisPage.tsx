import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { LoadingBlock } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { useInfografis } from '@/features/infografis/hooks/use-infografis';
import {
  DistribusiBarChart,
  DistribusiPieChart,
} from '@/features/infografis/components/DistribusiCharts';
import {
  agamaLabel,
  pendidikanLabel,
  statusPerkawinanLabel,
} from '@/features/penduduk/labels';
import type { Distribusi } from '@/features/infografis/types';
import type {
  Agama,
  Pendidikan,
  StatusPerkawinan,
} from '@/features/penduduk/types';

/** Terjemahkan label enum mentah pada distribusi menjadi label manusiawi. */
function relabel<T extends string>(
  data: Distribusi[],
  map: Record<T, string>,
): Distribusi[] {
  return data.map((d) => ({ ...d, label: map[d.label as T] ?? d.label }));
}

export default function InfografisPage() {
  const { data, isLoading, isError } = useInfografis();

  if (isLoading) return <LoadingBlock />;
  if (isError || !data)
    return <Alert tone="error">Gagal memuat data infografis.</Alert>;

  return (
    <div>
      <PageHeader
        title="Infografis Kependudukan"
        description="Visualisasi komposisi penduduk Desa Sukamaju."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title="Komposisi Agama"
            description="Jumlah penduduk per agama"
          />
          <CardContent>
            <DistribusiPieChart
              data={relabel<Agama>(data.perAgama, agamaLabel)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Kelompok Umur"
            description="Sebaran penduduk berdasarkan usia"
          />
          <CardContent>
            <DistribusiBarChart data={data.perKelompokUmur} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Tingkat Pendidikan"
            description="Pendidikan terakhir penduduk"
          />
          <CardContent>
            <DistribusiBarChart
              data={relabel<Pendidikan>(data.perPendidikan, pendidikanLabel)}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader
            title="Status Perkawinan"
            description="Komposisi status perkawinan"
          />
          <CardContent>
            <DistribusiPieChart
              data={relabel<StatusPerkawinan>(
                data.perStatusPerkawinan,
                statusPerkawinanLabel,
              )}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Sebaran per RW"
            description="Jumlah penduduk per Rukun Warga"
          />
          <CardContent>
            <DistribusiBarChart data={data.perDusun} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
