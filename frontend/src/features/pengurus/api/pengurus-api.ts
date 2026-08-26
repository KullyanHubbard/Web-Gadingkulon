import { apiClient } from '@/lib/api-client';
import type { Kursi, Pengurus, PengurusBaru, PengurusUbah } from '../types';

/** Kontrak kelola akun pengurus. Seluruh endpoint hanya untuk ADMIN. */
export interface PengurusApi {
  /** Seluruh kursi padukuhan, terisi maupun kosong. */
  daftarKursi(): Promise<Kursi[]>;
  tambah(payload: PengurusBaru): Promise<Pengurus>;
  ubah(id: string, payload: PengurusUbah): Promise<Pengurus>;
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
  async ubah(id, payload) {
    const { data } = await apiClient.patch<Pengurus>(
      `/pengurus/${id}`,
      payload,
    );
    return data;
  },
  async resetPassword(id, password) {
    await apiClient.post(`/pengurus/${id}/reset-password`, { password });
  },
};
