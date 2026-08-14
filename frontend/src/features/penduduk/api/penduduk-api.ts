import { apiClient } from '@/lib/api-client';
import type { Paginated, PaginationParams } from '@/types/api';
import type { KartuKeluarga, Penduduk } from '@/types/penduduk';

/** Kontrak API data kependudukan. */
export interface PendudukApi {
  /** Daftar penduduk dengan paginasi & pencarian (khusus admin). */
  list(params: PaginationParams): Promise<Paginated<Penduduk>>;
  /** Cari satu penduduk berdasarkan NIK. */
  getByNik(nik: string): Promise<Penduduk | null>;
  /** Ambil kartu keluarga (beserta anggotanya) berdasarkan nomor KK. */
  getKartuKeluarga(noKK: string): Promise<KartuKeluarga | null>;
}

export const pendudukApi: PendudukApi = {
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
