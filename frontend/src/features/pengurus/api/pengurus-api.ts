import { apiClient } from '@/lib/api-client';
import type { Kursi, Pengurus, PengurusBaru } from '../types';

/**
 * Kontrak kelola akun pengurus. Seluruh endpoint hanya untuk ADMIN.
 *
 * Tidak ada cara mengubah atau menonaktifkan akun dari sini: kursi hanya
 * berpindah tangan lewat pergantian yang disetujui (`features/pergantian`).
 */
export interface PengurusApi {
  /** Seluruh kursi padukuhan, terisi maupun kosong. */
  daftarKursi(): Promise<Kursi[]>;
  tambah(payload: PengurusBaru): Promise<Pengurus>;
  resetPassword(id: string, password: string): Promise<void>;
}

export const pengurusApi: PengurusApi = {
  async daftarKursi() {
    const { data } = await apiClient.get<Kursi[]>('/pengurus');
    return data;
  },
  async tambah(payload) {
    const { data } = await apiClient.post<Pengurus>('/pengurus', payload);
    return data;
  },
  async resetPassword(id, password) {
    await apiClient.post(`/pengurus/${id}/reset-password`, { password });
  },
};
