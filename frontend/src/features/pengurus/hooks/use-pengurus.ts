import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pengurusApi } from '../api/pengurus-api';
import type { PengurusBaru } from '../types';

/** Query keys terpusat agar caching konsisten & mudah di-invalidate. */
export const pengurusKeys = {
  all: ['pengurus'] as const,
  kursi: () => [...pengurusKeys.all, 'kursi'] as const,
};

export function useDaftarKursi() {
  return useQuery({
    queryKey: pengurusKeys.kursi(),
    queryFn: () => pengurusApi.daftarKursi(),
  });
}

/** Setiap mutasi menyegarkan daftar kursi — tabelnya harus langsung berubah. */
function useSegarkanKursi() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: pengurusKeys.all });
}

export function useTambahPengurus() {
  const segarkan = useSegarkanKursi();
  return useMutation({
    mutationFn: (payload: PengurusBaru) => pengurusApi.tambah(payload),
    onSuccess: segarkan,
  });
}

export function useResetPassword() {
  const segarkan = useSegarkanKursi();
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      pengurusApi.resetPassword(id, password),
    onSuccess: segarkan,
  });
}
