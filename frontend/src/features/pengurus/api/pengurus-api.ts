import { apiClient } from '@/lib/api-client';
import type { Jabatan, Pengurus, PengurusBaru } from '../types';

/**
 * Kontrak kelola akun pengurus. Seluruh endpoint hanya untuk ADMIN.
 *
 * Tidak ada cara mengubah atau menonaktifkan akun dari sini: jabatan hanya
 * berpindah tangan lewat pergantian yang disetujui (`features/pergantian`).
 */
export interface PengurusApi {
  /** Seluruh jabatan padukuhan, terisi maupun kosong. */
  daftarJabatan(): Promise<Jabatan[]>;
  tambah(payload: PengurusBaru): Promise<Pengurus>;
  resetPassword(id: string, password: string): Promise<void>;
  /** Ketua LPM bukan jabatan berakun — tidak ada `id`, hanya nama. */
  ubahLpm(nama: string): Promise<{ nama: string }>;
}

export const pengurusApi: PengurusApi = {
  async daftarJabatan() {
    const { data } = await apiClient.get<Jabatan[]>('/pengurus');
    return data;
  },
  async tambah(payload) {
    const { data } = await apiClient.post<Pengurus>('/pengurus', payload);
    return data;
  },
  async resetPassword(id, password) {
    await apiClient.post(`/pengurus/${id}/reset-password`, { password });
  },
  async ubahLpm(nama) {
    const { data } = await apiClient.patch<{ nama: string }>('/pengurus/lpm', {
      nama,
    });
    return data;
  },
};
