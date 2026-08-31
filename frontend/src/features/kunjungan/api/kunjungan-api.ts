import { apiClient } from '@/lib/api-client';

/**
 * Kontrak penghitung kunjungan harian — publik, tanpa auth.
 *
 * Dipisah `tambah`/`lihat` (bukan satu endpoint yang selalu menambah): halaman
 * kedua dst dalam hari yang sama harus BISA menampilkan angkanya tanpa ikut
 * menambah — itulah alasan hook pemanggilnya menyimpan tanda "sudah dihitung
 * hari ini" di `localStorage`.
 */
export interface KunjunganApi {
  tambah(): Promise<number>;
  lihat(): Promise<number>;
}

export const kunjunganApi: KunjunganApi = {
  async tambah() {
    const { data } = await apiClient.post<{ jumlah: number }>(
      '/publik/kunjungan',
    );
    return data.jumlah;
  },
  async lihat() {
    const { data } = await apiClient.get<{ jumlah: number }>(
      '/publik/kunjungan',
    );
    return data.jumlah;
  },
};
