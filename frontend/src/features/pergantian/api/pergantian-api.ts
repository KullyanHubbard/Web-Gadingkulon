import { apiClient } from '@/lib/api-client';
import type { Pengajuan } from '../types';

/** Kontrak pergantian jabatan. Pembagiannya tegas: Admin mengajukan & melihat,
 *  pengurus menjawab. Backend menolak yang salah pintu. */
export interface PergantianApi {
  /** ADMIN — seluruh pengajuan beserta riwayatnya. */
  daftar(): Promise<Pengajuan[]>;
  /** ADMIN — usulkan pergantian pemegang sebuah jabatan. */
  ajukan(jabatanKode: string, kandidatId: string): Promise<Pengajuan>;
  /** PENGURUS — pengajuan yang menunggu jawaban saya. */
  menunggu(): Promise<Pengajuan[]>;
  /** PENGURUS — satu suara, tidak bisa diubah. */
  jawab(id: string, setuju: boolean): Promise<Pengajuan>;
}

export const pergantianApi: PergantianApi = {
  async daftar() {
    const { data } = await apiClient.get<Pengajuan[]>('/pergantian');
    return data;
  },
  async ajukan(jabatanKode, kandidatId) {
    const { data } = await apiClient.post<Pengajuan>('/pergantian', {
      jabatanKode,
      kandidatId,
    });
    return data;
  },
  async menunggu() {
    const { data } = await apiClient.get<Pengajuan[]>('/pergantian/menunggu');
    return data;
  },
  async jawab(id, setuju) {
    const { data } = await apiClient.post<Pengajuan>(
      `/pergantian/${id}/jawab`,
      { setuju },
    );
    return data;
  },
};
