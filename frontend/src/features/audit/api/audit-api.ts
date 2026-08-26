import { apiClient } from '@/lib/api-client';
import type { CatatanAudit } from '../types';

/**
 * Kontrak riwayat perubahan.
 *
 * Satu endpoint, isi berbeda menurut peran: pengurus mendapat riwayat data
 * warga di wilayahnya, Admin mendapat riwayat kelola akun. Backend yang
 * memutuskan — klien tidak mengirim penyaring apa pun.
 */
export interface AuditApi {
  riwayat(): Promise<CatatanAudit[]>;
}

export const auditApi: AuditApi = {
  async riwayat() {
    const { data } = await apiClient.get<CatatanAudit[]>('/audit');
    return data;
  },
};
