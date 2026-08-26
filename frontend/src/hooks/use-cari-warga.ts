import { useQuery } from '@tanstack/react-query';
import { cariWarga } from '@/lib/warga-api';

export const cariWargaKeys = {
  all: ['cari-warga'] as const,
  q: (q: string, kursi: string) => [...cariWargaKeys.all, kursi, q] as const,
};

/**
 * Pencarian warga untuk dropdown pemilihan (ADMIN).
 *
 * Di `hooks/`, bukan di dalam fitur: dua fitur memakainya (mengisi kursi kosong
 * dan mengajukan pergantian).
 */
export function useCariWarga(q: string, kursi?: string) {
  return useQuery({
    queryKey: cariWargaKeys.q(q.trim(), kursi ?? ''),
    queryFn: () => cariWarga(q, kursi),
    // Backend mengembalikan kosong di bawah 2 huruf; jangan menanyakannya.
    enabled: q.trim().length >= 2,
  });
}
