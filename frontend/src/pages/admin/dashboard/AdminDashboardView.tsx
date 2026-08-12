import { Link } from 'react-router-dom';
import { ArrowRight, Home, User, UserRound, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { DistribusiBarChart } from '@/components/ui/DistribusiCharts';
import { QueryBoundary } from '@/components/ui/QueryBoundary';
import { StatCard } from '@/features/infografis/components/StatCard';
import { paths } from '@/routes/paths';
import type { Distribusi } from '@/types/statistik';
import type { StatRingkas } from './dashboard-view-model';

/** Ikon per kartu statistik — murni pilihan tampilan, jadi dipetakan di sini. */
const ikonStat: Record<StatRingkas['id'], LucideIcon> = {
  penduduk: Users,
  kk: Home,
  lakiLaki: User,
  perempuan: UserRound,
};

interface AdminDashboardViewProps {
  namaPengurus: string;
  isLoading: boolean;
  isError: boolean;
  stats: StatRingkas[] | undefined;
  distribusiUsia: Distribusi[] | undefined;
}

/** Dashboard pengurus: angka ringkas, satu grafik, dan pintasan. Tampilan saja. */
export function AdminDashboardView({
  namaPengurus,
  isLoading,
  isError,
  stats,
  distribusiUsia,
}: AdminDashboardViewProps) {
  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`Selamat datang, ${namaPengurus}. Ringkasan data Desa Sukamaju.`}
      />

      <QueryBoundary
        isLoading={isLoading}
        isError={isError}
        data={stats}
        errorMessage="Gagal memuat ringkasan data."
      >
        {(daftarStat) => (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {daftarStat.map((stat) => (
                <StatCard
                  key={stat.id}
                  label={stat.label}
                  value={stat.value}
                  icon={ikonStat[stat.id]}
                  tone={stat.tone}
                />
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader
                  title="Distribusi Usia"
                  description="Jumlah penduduk per kelompok umur"
                  action={
                    <Link to={paths.admin.infografis}>
                      <Button variant="ghost" size="sm">
                        Lihat semua <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  }
                />
                <CardContent>
                  <DistribusiBarChart data={distribusiUsia ?? []} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader title="Akses Cepat" />
                <CardContent className="space-y-2">
                  <Link to={paths.admin.penduduk} className="block">
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      Kelola Data Penduduk <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link to={paths.admin.infografis} className="block">
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                    >
                      Lihat Infografis <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </QueryBoundary>
    </div>
  );
}
