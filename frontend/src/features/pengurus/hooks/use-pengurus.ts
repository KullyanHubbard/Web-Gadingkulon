import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pengurusApi } from '../api/pengurus-api';
import type { PengurusBaru, PengurusUbah } from '../types';

/** Query keys terpusat agar caching konsisten & mudah di-invalidate. */
export const pengurusKeys = {
  all: ['pengurus'] as const,
  list: () => [...pengurusKeys.all, 'list'] as const,
};

export function usePengurusList() {
  return useQuery({
    queryKey: pengurusKeys.list(),
    queryFn: () => pengurusApi.list(),
  });
}

/** Setiap mutasi menyegarkan daftar — tabelnya harus langsung ikut berubah. */
function useSegarkanDaftar() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: pengurusKeys.all });
}

export function useTambahPengurus() {
  const segarkan = useSegarkanDaftar();
  return useMutation({
    mutationFn: (payload: PengurusBaru) => pengurusApi.tambah(payload),
    onSuccess: segarkan,
  });
}

export function useUbahPengurus() {
  const segarkan = useSegarkanDaftar();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: PengurusUbah }) =>
      pengurusApi.ubah(id, payload),
    onSuccess: segarkan,
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      pengurusApi.resetPassword(id, password),
  });
}
