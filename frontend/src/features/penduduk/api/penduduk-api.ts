import { isMockMode } from '@/config/env';
import { apiClient } from '@/lib/api-client';
import { pendudukData } from '@/mocks/data/penduduk';
import { delay } from '@/mocks/utils';
import type { Paginated, PaginationParams } from '@/types/api';
import type { KartuKeluarga, Penduduk } from '../types';

/** Kontrak API data kependudukan. */
export interface PendudukApi {
  /** Daftar penduduk dengan paginasi & pencarian (khusus admin). */
  list(params: PaginationParams): Promise<Paginated<Penduduk>>;
  /** Cari satu penduduk berdasarkan NIK. */
  getByNik(nik: string): Promise<Penduduk | null>;
  /** Ambil kartu keluarga (beserta anggotanya) berdasarkan nomor KK. */
  getKartuKeluarga(noKK: string): Promise<KartuKeluarga | null>;
}

function buildKartuKeluarga(noKK: string): KartuKeluarga | null {
  const anggota = pendudukData.filter((p) => p.noKK === noKK);
  if (anggota.length === 0) return null;

  const kepala =
    anggota.find((p) => p.statusHubunganKeluarga === 'KEPALA_KELUARGA') ??
    anggota[0];

  return {
    noKK,
    kepalaKeluarga: kepala.nama,
    alamat: kepala.alamat,
    anggota,
  };
}

const mockPendudukApi: PendudukApi = {
  async list({ page = 1, pageSize = 10, search = '' }) {
    await delay();
    const q = search.trim().toLowerCase();
    const filtered = q
      ? pendudukData.filter(
          (p) =>
            p.nama.toLowerCase().includes(q) ||
            p.nik.includes(q) ||
            p.noKK.includes(q),
        )
      : pendudukData;

    const start = (page - 1) * pageSize;
    return {
      items: filtered.slice(start, start + pageSize),
      total: filtered.length,
      page,
      pageSize,
    };
  },

  async getByNik(nik) {
    await delay();
    return pendudukData.find((p) => p.nik === nik.trim()) ?? null;
  },

  async getKartuKeluarga(noKK) {
    await delay();
    return buildKartuKeluarga(noKK.trim());
  },
};

const httpPendudukApi: PendudukApi = {
  async list(params) {
    const { data } = await apiClient.get<Paginated<Penduduk>>('/penduduk', {
      params,
    });
    return data;
  },
  async getByNik(nik) {
    const { data } = await apiClient.get<Penduduk>(`/penduduk/nik/${nik}`);
    return data;
  },
  async getKartuKeluarga(noKK) {
    const { data } = await apiClient.get<KartuKeluarga>(
      `/kartu-keluarga/${noKK}`,
    );
    return data;
  },
};

export const pendudukApi: PendudukApi = isMockMode
  ? mockPendudukApi
  : httpPendudukApi;
