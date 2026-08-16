import { cn } from '@/lib/utils';
import type { PanelDistribusi } from '@/types/statistik';
import { Card, CardContent, CardHeader } from './Card';
import { DistribusiBarChart } from './DistribusiBarChart';
import { DistribusiPieChart } from './DistribusiPieChart';

/**
 * Hanya kartunya — grid pembungkusnya milik pemanggil, karena breakpoint
 * kolomnya berbeda per halaman.
 */
export function PanelDistribusiCard({ panel }: { panel: PanelDistribusi }) {
  return (
    <Card className={cn(panel.lebarPenuh && 'lg:col-span-2')}>
      <CardHeader title={panel.judul} description={panel.deskripsi} />
      <CardContent>
        {panel.jenis === 'pie' ? (
          <DistribusiPieChart data={panel.data} />
        ) : (
          <DistribusiBarChart data={panel.data} />
        )}
      </CardContent>
    </Card>
  );
}
