import { useMemo } from 'react';
import { toStatWarga } from '@/lib/stat-warga';
import { useInfografis } from '../hooks/use-infografis';
import { AdminDashboardView } from './AdminDashboardView';

interface AdminDashboardProps {
  /**
   * Nama pengurus untuk sapaan di header. Disuntik dari luar supaya fitur
   * infografis tidak perlu mengenal fitur auth (CLAUDE.md §4).
   */
  namaPengurus: string;
}

/**
 * Penghubung data dashboard pengurus: agregat statistik jadi angka ringkas.
 * Tampilannya sepenuhnya ada di `AdminDashboardView`.
 */
export function AdminDashboard({ namaPengurus }: AdminDashboardProps) {
  const { data, isLoading, isError } = useInfografis();

  const stats = useMemo(() => (data ? toStatWarga(data) : undefined), [data]);

  return (
    <AdminDashboardView
      namaPengurus={namaPengurus}
      isLoading={isLoading}
      isError={isError}
      stats={stats}
      distribusiUsia={data?.perKelompokUmur}
    />
  );
}
