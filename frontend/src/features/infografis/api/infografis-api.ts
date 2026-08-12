import { isMockMode } from '@/config/env';
import { apiClient } from '@/lib/api-client';
import { pendudukData } from '@/mocks/data/penduduk';
import { delay } from '@/mocks/utils';
import { hitungUmur } from '@/features/penduduk/utils';
import type { Penduduk } from '@/features/penduduk/types';
import type { Distribusi, InfografisData } from '../types';

/** Kontrak API infografis (agregat statistik) — khusus admin. */
export interface InfografisApi {
  get(): Promise<InfografisData>;
}

/** Hitung distribusi dari sebuah key kategori. */
function distribusiBy(
  data: Penduduk[],
  keyFn: (p: Penduduk) => string,
): Distribusi[] {
  const counter = new Map<string, number>();
  for (const p of data) {
    const key = keyFn(p);
    counter.set(key, (counter.get(key) ?? 0) + 1);
  }
  return [...counter.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);
}

function kelompokUmur(umur: number): string {
  if (umur <= 5) return '0-5';
  if (umur <= 12) return '6-12';
  if (umur <= 17) return '13-17';
  if (umur <= 25) return '18-25';
  if (umur <= 40) return '26-40';
  if (umur <= 60) return '41-60';
  return '60+';
}

function computeInfografis(): InfografisData {
  return {
    totalPenduduk: pendudukData.length,
    totalKK: new Set(pendudukData.map((p) => p.noKK)).size,
    totalLakiLaki: pendudukData.filter((p) => p.jenisKelamin === 'LAKI_LAKI')
      .length,
    totalPerempuan: pendudukData.filter((p) => p.jenisKelamin === 'PEREMPUAN')
      .length,
    perAgama: distribusiBy(pendudukData, (p) => p.agama),
    perPendidikan: distribusiBy(pendudukData, (p) => p.pendidikan),
    perStatusPerkawinan: distribusiBy(pendudukData, (p) => p.statusPerkawinan),
    perDusun: distribusiBy(pendudukData, (p) => `RW ${p.alamat.rw}`),
    perKelompokUmur: distribusiBy(pendudukData, (p) =>
      kelompokUmur(hitungUmur(p.tanggalLahir)),
    ).sort((a, b) => a.label.localeCompare(b.label)),
  };
}

const mockInfografisApi: InfografisApi = {
  async get() {
    await delay();
    return computeInfografis();
  },
};

const httpInfografisApi: InfografisApi = {
  async get() {
    const { data } = await apiClient.get<InfografisData>('/infografis');
    return data;
  },
};

export const infografisApi: InfografisApi = isMockMode
  ? mockInfografisApi
  : httpInfografisApi;
