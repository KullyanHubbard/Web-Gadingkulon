import { apiClient } from '@/lib/api-client';
import type { Paginated, PaginationParams } from '@/types/api';
import type { FilterOpsi, FilterPenduduk, Penduduk } from '@/types/penduduk';

/** Kontrak API data kependudukan. Semua endpoint butuh sesi pengurus. */
export interface PendudukApi {
  /** Daftar penduduk: paginasi, cari nama, dan filter kategori (AND). */
  list(params: PaginationParams & FilterPenduduk): Promise<Paginated<Penduduk>>;
  /** Detail satu penduduk. `id` dibangkitkan saat impor, bukan NIK. */
  getById(id: string): Promise<Penduduk | null>;
  /** Pilihan filter non-enum (RT, RW, pekerjaan) dari isi data. */
  filterOpsi(): Promise<FilterOpsi>;
}

export const pendudukApi: PendudukApi = {
  async list(params) {
    const { data } = await apiClient.get<Paginated<Penduduk>>('/penduduk', {
      params,
    });
    return data;
  },
  async getById(id) {
    const { data } = await apiClient.get<Penduduk>(`/penduduk/${id}`);
    return data;
  },
  async filterOpsi() {
    const { data } = await apiClient.get<FilterOpsi>('/penduduk/filter-opsi');
    return data;
  },
};
