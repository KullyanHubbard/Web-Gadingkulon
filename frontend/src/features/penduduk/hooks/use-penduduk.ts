import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { PaginationParams } from '@/types/api';
import type { FilterPenduduk, PendudukBaru, PendudukUbah } from '../types';
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

/** Tiap perubahan menyegarkan daftar, detail, pilihan filter, dan infografis —
 *  angka agregat ikut bergerak begitu satu warga berubah. */
function useSegarkanPenduduk() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: pendudukKeys.all });
    void queryClient.invalidateQueries({ queryKey: ['infografis'] });
  };
}

export function useTambahPenduduk() {
  const segarkan = useSegarkanPenduduk();
  return useMutation({
    mutationFn: (payload: PendudukBaru) => pendudukApi.tambah(payload),
    onSuccess: segarkan,
  });
}

export function useUbahPenduduk() {
  const segarkan = useSegarkanPenduduk();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PendudukUbah }) =>
      pendudukApi.ubah(id, payload),
    onSuccess: segarkan,
  });
}
