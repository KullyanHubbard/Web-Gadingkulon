import { apiClient } from '@/lib/api-client';
import type { StatistikPublik } from '../types';

/**
 * Kontrak statistik publik — dipakai halaman masuk, tanpa autentikasi.
 *
 * Dipisah dari `InfografisApi` dengan sengaja: infografis melayani pengurus di
 * balik JWT, sedangkan yang ini terbuka untuk siapa saja. Menyatukan keduanya
 * berarti endpoint admin harus bisa diakses anonim — persis yang tidak boleh.
 */
export interface StatistikPublikApi {
  get(): Promise<StatistikPublik>;
}

export const statistikPublikApi: StatistikPublikApi = {
  async get() {
    const { data } = await apiClient.get<StatistikPublik>('/publik/statistik');
    return data;
  },
};
