import { useMemo } from 'react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { labelWilayah } from '@/features/auth/wilayah';
import { InfografisView } from '@/features/infografis/components/InfografisView';
import { useInfografis } from '@/features/infografis/hooks/use-infografis';
import { toPanelInfografis } from './view-model';

/** Container halaman infografis: ambil agregat, ubah jadi panel siap tampil. */
export default function InfografisPage() {
  const { data, isLoading, isError } = useInfografis();
  const { user } = useAuth();

  const panels = useMemo(
    () => (data ? toPanelInfografis(data) : undefined),
    [data],
  );

  return (
    <InfografisView
      isLoading={isLoading}
      isError={isError}
      panels={panels}
      wilayah={labelWilayah(user)}
    />
  );
}
