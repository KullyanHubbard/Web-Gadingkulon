import { apiClient } from '@/lib/api-client';
import type { StatistikPublik } from '../types';

/**
 * Kontrak statistik publik — dipakai halaman masuk, tanpa autentikasi.
 *
 * Dipisah dari `InfografisApi` dengan sengaja: infografis melayani pengurus di
 * balik sesi login, sedangkan yang ini terbuka untuk siapa saja. Menyatukan keduanya
 * berarti endpoint admin harus bisa diakses anonim — persis yang tidak boleh.
 */
export interface StatistikPublikApi {
  /** `periode` bentuk `YYYY-MM`; kosong = keadaan hari ini. */
  get(periode?: string): Promise<StatistikPublik>;
}

export const statistikPublikApi: StatistikPublikApi = {
  async get(periode) {
    const { data } = await apiClient.get<StatistikPublik>('/publik/statistik', {
      params: periode ? { periode } : undefined,
    });
    return data;
  },
};
