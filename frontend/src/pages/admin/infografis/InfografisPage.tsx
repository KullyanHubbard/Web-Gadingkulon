import { useMemo } from 'react';
import { useInfografis } from '@/features/infografis/hooks/use-infografis';
import { toPanelInfografis } from './infografis-view-model';
import { InfografisView } from './InfografisView';

/** Container halaman infografis: ambil agregat, ubah jadi panel siap tampil. */
export default function InfografisPage() {
  const { data, isLoading, isError } = useInfografis();

  const panels = useMemo(
    () => (data ? toPanelInfografis(data) : undefined),
    [data],
  );

  return (
    <InfografisView isLoading={isLoading} isError={isError} panels={panels} />
  );
}
