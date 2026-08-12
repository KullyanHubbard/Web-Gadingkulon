import { useQuery, keepPreviousData } from '@tanstack/react-query';
import type { PaginationParams } from '@/types/api';
import { pendudukApi } from '../api/penduduk-api';

/** Query keys terpusat agar caching konsisten & mudah di-invalidate. */
export const pendudukKeys = {
  all: ['penduduk'] as const,
  list: (params: PaginationParams) =>
    [...pendudukKeys.all, 'list', params] as const,
  byNik: (nik: string) => [...pendudukKeys.all, 'nik', nik] as const,
  kk: (noKK: string) => [...pendudukKeys.all, 'kk', noKK] as const,
};

/** Daftar penduduk (admin) dengan paginasi + pencarian. */
export function usePendudukList(params: PaginationParams) {
  return useQuery({
    queryKey: pendudukKeys.list(params),
    queryFn: () => pendudukApi.list(params),
    placeholderData: keepPreviousData,
  });
}

/** Detail penduduk berdasarkan NIK. */
export function usePendudukByNik(nik: string, enabled = true) {
  return useQuery({
    queryKey: pendudukKeys.byNik(nik),
    queryFn: () => pendudukApi.getByNik(nik),
    enabled: enabled && nik.trim().length > 0,
  });
}

/** Kartu keluarga berdasarkan nomor KK. */
export function useKartuKeluarga(noKK: string, enabled = true) {
  return useQuery({
    queryKey: pendudukKeys.kk(noKK),
    queryFn: () => pendudukApi.getKartuKeluarga(noKK),
    enabled: enabled && noKK.trim().length > 0,
  });
}
