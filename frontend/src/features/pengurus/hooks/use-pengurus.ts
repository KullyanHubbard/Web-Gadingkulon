import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pengurusApi } from '../api/pengurus-api';
import type { PengurusBaru } from '../types';

/** Query keys terpusat agar caching konsisten & mudah di-invalidate. */
export const pengurusKeys = {
  all: ['pengurus'] as const,
  jabatan: () => [...pengurusKeys.all, 'jabatan'] as const,
};

export function useDaftarJabatan() {
  return useQuery({
    queryKey: pengurusKeys.jabatan(),
    queryFn: () => pengurusApi.daftarJabatan(),
  });
}

/** Setiap mutasi menyegarkan daftar jabatan — tabelnya harus langsung berubah. */
function useSegarkanJabatan() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: pengurusKeys.all });
}

export function useTambahPengurus() {
  const segarkan = useSegarkanJabatan();
  return useMutation({
    mutationFn: (payload: PengurusBaru) => pengurusApi.tambah(payload),
    onSuccess: segarkan,
  });
}

export function useResetPassword() {
  const segarkan = useSegarkanJabatan();
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      pengurusApi.resetPassword(id, password),
    onSuccess: segarkan,
  });
}

/**
 * Menyegarkan `/publik/struktur-organisasi` lewat key literalnya, BUKAN
 * `strukturOrganisasiKeys` yang diekspor `features/struktur-organisasi`:
 * fitur ini tidak boleh mengimpor internal fitur lain (CLAUDE.md §4).
 */
export function useUbahLpm() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (nama: string) => pengurusApi.ubahLpm(nama),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['struktur-organisasi'] });
    },
  });
}
