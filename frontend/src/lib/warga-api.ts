import { apiClient } from '@/lib/api-client';

/**
 * Sepotong data warga sekadar untuk dropdown pemilihan: nama + RT/RW.
 *
 * Di `lib`, bukan di dalam salah satu fitur: dipakai `pengurus` (mengisi
 * jabatan kosong) dan `pergantian` (memilih kandidat), dan fitur tidak boleh
 * saling impor (CLAUDE.md §4).
 */
export interface WargaPilihan {
  id: string;
  nama: string;
  rt: string;
  rw: string;
}

/**
 * Cari warga untuk dipilih Admin. Backend mengembalikan kosong di bawah 2 huruf.
 *
 * `jabatanKode` mempersempit hasil ke warga yang boleh memegangnya — Ketua RT
 * dari RT-nya, Ketua RW dari RW-nya, Dukuh dari mana pun. Backend menegakkan
 * aturan yang sama saat menyimpan; penyempitan di sini supaya Admin tidak
 * sempat memilih orang yang pasti ditolak.
 */
export async function cariWarga(
  q: string,
  jabatanKode?: string,
): Promise<WargaPilihan[]> {
  const { data } = await apiClient.get<WargaPilihan[]>('/pengurus/warga', {
    params: { q, jabatanKode },
  });
  return data;
}
