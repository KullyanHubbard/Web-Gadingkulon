import { Link } from 'react-router-dom';
import { Users, Home, User, UserRound, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { LoadingBlock } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useInfografis } from '@/features/infografis/hooks/use-infografis';
import { StatCard } from '@/features/infografis/components/StatCard';
import { DistribusiBarChart } from '@/features/infografis/components/DistribusiCharts';
import { paths } from '@/routes/paths';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useInfografis();

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description={`Selamat datang, ${user?.nama}. Ringkasan data Desa Sukamaju.`}
      />

      {isLoading ? (
        <LoadingBlock />
      ) : isError || !data ? (
        <Alert tone="error">Gagal memuat ringkasan data.</Alert>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Total Penduduk"
              value={data.totalPenduduk}
              icon={Users}
              tone="brand"
            />
            <StatCard
              label="Kartu Keluarga"
              value={data.totalKK}
              icon={Home}
              tone="violet"
            />
            <StatCard
              label="Laki-laki"
              value={data.totalLakiLaki}
              icon={User}
              tone="green"
            />
            <StatCard
              label="Perempuan"
              value={data.totalPerempuan}
              icon={UserRound}
              tone="amber"
            />
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
                <DistribusiBarChart data={data.perKelompokUmur} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader title="Akses Cepat" />
              <CardContent className="space-y-2">
                <Link to={paths.admin.penduduk} className="block">
                  <Button variant="outline" className="w-full justify-between">
                    Kelola Data Penduduk <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to={paths.admin.infografis} className="block">
                  <Button variant="outline" className="w-full justify-between">
                    Lihat Infografis <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
