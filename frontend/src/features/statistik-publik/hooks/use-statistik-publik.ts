import { useQuery } from '@tanstack/react-query';
import { statistikPublikApi } from '../api/statistik-publik-api';

export const statistikPublikKeys = {
  all: ['statistik-publik'] as const,
};

export function useStatistikPublik() {
  return useQuery({
    queryKey: statistikPublikKeys.all,
    queryFn: () => statistikPublikApi.get(),
  });
}
