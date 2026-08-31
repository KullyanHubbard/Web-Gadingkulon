import { useQuery } from '@tanstack/react-query';
import { statistikPublikApi } from '../api/statistik-publik-api';

export const statistikPublikKeys = {
  all: ['statistik-publik'] as const,
  /** Periode ikut kunci: dua bulan berbeda adalah dua jawaban berbeda. */
  periode: (periode?: string) =>
    ['statistik-publik', periode ?? 'kini'] as const,
};

export function useStatistikPublik(periode?: string) {
  return useQuery({
    queryKey: statistikPublikKeys.periode(periode),
    queryFn: () => statistikPublikApi.get(periode),
  });
}
