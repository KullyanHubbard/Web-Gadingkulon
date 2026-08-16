import { PageHeader } from '@/components/layout/PageHeader';
import { PanelDistribusiCard } from '@/components/ui/PanelDistribusiCard';
import { QueryBoundary } from '@/components/ui/QueryBoundary';
import type { PanelDistribusi } from '@/types/statistik';

interface InfografisViewProps {
  isLoading: boolean;
  isError: boolean;
  panels: PanelDistribusi[] | undefined;
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
        description="Visualisasi komposisi penduduk padukuhan."
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
              <PanelDistribusiCard key={panel.id} panel={panel} />
            ))}
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}
