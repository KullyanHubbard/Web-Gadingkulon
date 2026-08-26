import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { PaginationParams } from '@/types/api';
import type { FilterPenduduk } from '@/types/penduduk';
import { pendudukApi } from '../api/penduduk-api';

type ListParams = PaginationParams & FilterPenduduk;

/**
 * Query keys terpusat agar caching konsisten & mudah di-invalidate. `params`
 * ikut masuk key: tiap kombinasi filter punya cache sendiri.
 */
export const pendudukKeys = {
  all: ['penduduk'] as const,
  list: (params: ListParams) => [...pendudukKeys.all, 'list', params] as const,
  byId: (id: string) => [...pendudukKeys.all, 'id', id] as const,
  filterOpsi: () => [...pendudukKeys.all, 'filter-opsi'] as const,
};

/** Daftar penduduk dengan paginasi, pencarian nama, dan filter kategori. */
export function usePendudukList(params: ListParams) {
  return useQuery({
    queryKey: pendudukKeys.list(params),
    queryFn: () => pendudukApi.list(params),
    placeholderData: keepPreviousData,
  });
}

/** Detail penduduk berdasarkan id. */
export function usePendudukById(id: string, enabled = true) {
  return useQuery({
    queryKey: pendudukKeys.byId(id),
    queryFn: () => pendudukApi.getById(id),
    enabled: enabled && id.trim().length > 0,
  });
}

/**
 * Pilihan RT/RW/pekerjaan untuk dropdown filter. Jarang berubah — data
 * penduduk read-only sampai impor Excel berikutnya.
 */
export function useFilterOpsi() {
  return useQuery({
    queryKey: pendudukKeys.filterOpsi(),
    queryFn: () => pendudukApi.filterOpsi(),
    staleTime: 5 * 60 * 1000,
  });
}
