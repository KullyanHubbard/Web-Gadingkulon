import { useMemo } from 'react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useInfografis } from '@/features/infografis/hooks/use-infografis';
import { toStatRingkas } from './dashboard-view-model';
import { AdminDashboardView } from './AdminDashboardView';

/** Container dashboard pengurus: sesi + agregat statistik. */
export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, isError } = useInfografis();

  const stats = useMemo(() => (data ? toStatRingkas(data) : undefined), [data]);

  return (
    <AdminDashboardView
      namaPengurus={user?.nama ?? ''}
      isLoading={isLoading}
      isError={isError}
      stats={stats}
      distribusiUsia={data?.perKelompokUmur}
    />
  );
}
