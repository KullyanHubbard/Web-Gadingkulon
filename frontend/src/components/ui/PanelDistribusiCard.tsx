import { cn } from '@/lib/utils';
import type { PanelDistribusi } from '@/types/statistik';
import { Card, CardContent, CardHeader } from './Card';
import { DistribusiBarChart, DistribusiPieChart } from './DistribusiCharts';

/**
 * Satu panel chart berkartu.
 *
 * Hanya kartunya — grid pembungkusnya tetap milik pemanggil, karena breakpoint
 * kolomnya memang berbeda per halaman (infografis punya lebar penuh, rincian RW
 * berbagi ruang dengan rail kiri).
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
