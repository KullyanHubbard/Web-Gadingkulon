import { apiClient } from '@/lib/api-client';
import type { Paginated, PaginationParams } from '@/types/api';
import type {
  FilterOpsi,
  FilterPenduduk,
  Penduduk,
  PendudukBaru,
  PendudukUbah,
} from '../types';

/** Kontrak API data kependudukan. Semua endpoint butuh sesi pengurus. */
export interface PendudukApi {
  /** Daftar penduduk: paginasi, cari nama, dan filter kategori (AND). */
  list(params: PaginationParams & FilterPenduduk): Promise<Paginated<Penduduk>>;
  /** Detail satu penduduk. `id` dibangkitkan saat impor, bukan NIK. */
  getById(id: string): Promise<Penduduk | null>;
  /** Pilihan filter non-enum (RT, RW, pekerjaan) dari isi data. */
  filterOpsi(): Promise<FilterOpsi>;
  /** Tambah warga di wilayah sendiri. Kode Warganya dibangkitkan backend. */
  tambah(payload: PendudukBaru): Promise<Penduduk>;
  /** Ubah sebagian data satu warga. */
  ubah(id: string, payload: PendudukUbah): Promise<Penduduk>;
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
  async tambah(payload) {
    const { data } = await apiClient.post<Penduduk>('/penduduk', payload);
    return data;
  },
  async ubah(id, payload) {
    const { data } = await apiClient.patch<Penduduk>(
      `/penduduk/${id}`,
      payload,
    );
    return data;
  },
};
