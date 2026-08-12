import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import {
  DistribusiBarChart,
  DistribusiPieChart,
} from '@/components/ui/DistribusiCharts';
import { QueryBoundary } from '@/components/ui/QueryBoundary';
import { cn } from '@/lib/utils';
import type { PanelInfografis } from './infografis-view-model';

interface InfografisViewProps {
  isLoading: boolean;
  isError: boolean;
  panels: PanelInfografis[] | undefined;
}

/** Halaman infografis: judul + grid panel. Tampilan saja. */
export function InfografisView({
  isLoading,
  isError,
  panels,
}: InfografisViewProps) {
  return (
    <div>
      <PageHeader
        title="Infografis Kependudukan"
        description="Visualisasi komposisi penduduk Desa Sukamaju."
      />

      <QueryBoundary
        isLoading={isLoading}
        isError={isError}
        data={panels}
        errorMessage="Gagal memuat data infografis."
      >
        {(daftar) => (
          <div className="grid gap-6 lg:grid-cols-2">
            {daftar.map((panel) => (
              <Card
                key={panel.id}
                className={cn(panel.lebarPenuh && 'lg:col-span-2')}
              >
                <CardHeader title={panel.judul} description={panel.deskripsi} />
                <CardContent>
                  {panel.jenis === 'pie' ? (
                    <DistribusiPieChart data={panel.data} />
                  ) : (
                    <DistribusiBarChart data={panel.data} />
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}
