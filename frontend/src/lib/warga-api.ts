import { apiClient } from '@/lib/api-client';

/**
 * Sepotong data warga sekadar untuk dropdown pemilihan: nama + RT/RW.
 *
 * Di `lib`, bukan di dalam salah satu fitur: dipakai `pengurus` (mengisi kursi
 * kosong) dan `pergantian` (memilih kandidat), dan fitur tidak boleh saling
 * impor (CLAUDE.md §4).
 */
export interface WargaPilihan {
  id: string;
  nama: string;
  rt: string;
  rw: string;
}

/** Cari warga untuk dipilih Admin. Backend mengembalikan kosong di bawah 2 huruf. */
export async function cariWarga(q: string): Promise<WargaPilihan[]> {
  const { data } = await apiClient.get<WargaPilihan[]>('/pengurus/warga', {
    params: { q },
  });
  return data;
}
