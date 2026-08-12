import { isMockMode } from '@/config/env';
import { apiClient } from '@/lib/api-client';
import { formatRw } from '@/lib/wilayah';
import { pendudukData } from '@/mocks/data/penduduk';
import { delay } from '@/mocks/utils';
import type { Distribusi } from '@/types/statistik';
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

/** Cacah jiwa per RW, urut menaik menurut nomor RW (urutan baca, bukan besaran). */
function hitungPerRw(): Distribusi[] {
  const counter = new Map<string, number>();
  for (const p of pendudukData) {
    counter.set(p.alamat.rw, (counter.get(p.alamat.rw) ?? 0) + 1);
  }
  return [...counter.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([rw, value]) => ({ label: formatRw(rw), value }));
}

const mockStatistikPublikApi: StatistikPublikApi = {
  async get() {
    await delay();
    return {
      totalPenduduk: pendudukData.length,
      perRw: hitungPerRw(),
    };
  },
};

const httpStatistikPublikApi: StatistikPublikApi = {
  async get() {
    const { data } = await apiClient.get<StatistikPublik>('/publik/statistik');
    return data;
  },
};

export const statistikPublikApi: StatistikPublikApi = isMockMode
  ? mockStatistikPublikApi
  : httpStatistikPublikApi;
