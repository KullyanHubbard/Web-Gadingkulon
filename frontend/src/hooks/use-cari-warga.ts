import { useQuery } from '@tanstack/react-query';
import { cariWarga } from '@/lib/warga-api';

export const cariWargaKeys = {
  all: ['cari-warga'] as const,
  q: (q: string, jabatanKode: string) =>
    [...cariWargaKeys.all, jabatanKode, q] as const,
};

/**
 * Pencarian warga untuk dropdown pemilihan (ADMIN).
 *
 * Di `hooks/`, bukan di dalam fitur: dua fitur memakainya (mengisi jabatan
 * kosong dan mengajukan pergantian).
 */
export function useCariWarga(q: string, jabatanKode?: string) {
  return useQuery({
    queryKey: cariWargaKeys.q(q.trim(), jabatanKode ?? ''),
    queryFn: () => cariWarga(q, jabatanKode),
    // Backend mengembalikan kosong di bawah 2 huruf; jangan menanyakannya.
    enabled: q.trim().length >= 2,
  });
}
