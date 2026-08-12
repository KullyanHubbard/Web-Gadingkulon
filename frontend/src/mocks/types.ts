/**
 * Tipe untuk data mock yang disimpan sebagai JSON di `src/mocks/data/`.
 *
 * Hanya bentuk data — tidak ada logika autentikasi di sini. Aturan masa
 * berlaku ditegakkan backend (lihat CLAUDE.md §11); file ini semata-mata
 * menyediakan fixture untuk mengujinya.
 */

/**
 * Jabatan pengurus padukuhan. Ketiganya berperan `ADMIN` di model auth
 * (lihat `features/auth/types.ts`) — jabatan bersifat deskriptif, bukan
 * pembeda hak akses data. Nomor RT/RW dibedakan lewat `username`.
 */
export type JabatanPengurus = 'DUKUH' | 'KETUA_RW' | 'KETUA_RT';

/**
 * Status akun pengurus.
 *
 * `nonaktif` dicabut secara manual oleh pengelola akun dan **menang atas**
 * `berlakuSampai`: akun nonaktif tetap ditolak walaupun masa jabatannya
 * masih jauh dari kedaluwarsa.
 */
export type StatusPengurus = 'aktif' | 'nonaktif';

/** Satu baris akun pengurus di data mock. */
export interface MockPengurus {
  id: string;
  /** Kredensial masuk pengurus di `/login/petugas`. Fiktif, seperti `nama`. */
  username: string;
  nama: string;
  jabatan: JabatanPengurus;
  /**
   * Batas akhir masa jabatan, format `YYYY-MM-DD`.
   *
   * **`null` berarti tidak pernah kedaluwarsa** — dipakai jabatan tanpa masa
   * bakti tetap (Dukuh), supaya sistem tidak bisa kehilangan seluruh
   * pengelola akunnya karena satu tanggal terlewat.
   *
   * Tanggal ini bersifat **inklusif**: akun sah sampai akhir hari tersebut.
   * Perbandingan yang benar adalah `hariIni > berlakuSampai`, bukan `>=` —
   * `>=` mematikan akun sehari lebih cepat dan baru ketahuan saat pengurus
   * sungguhan tidak bisa masuk.
   */
  berlakuSampai: string | null;
  status: StatusPengurus;
  /**
   * Boleh membuat, menonaktifkan, dan mereset akun pengurus lain.
   *
   * Hak ini hanya berlaku bila akunnya juga lolos pemeriksaan `status` dan
   * `berlakuSampai`. Flag `true` pada akun `nonaktif` adalah **catatan
   * historis**, bukan izin aktif — lihat `dinonaktifkanOleh`.
   */
  bisaKelolaAkun: boolean;
  /**
   * FK ke `MockPengurus.id` — siapa yang menonaktifkan akun ini.
   * Wajib terisi bila `status === 'nonaktif'`, dan wajib menunjuk akun yang
   * `bisaKelolaAkun === true` **pada saat penonaktifan terjadi**.
   */
  dinonaktifkanOleh: string | null;
  /** ISO 8601 dengan offset `+07:00` (WIB). Wajib terisi bila `nonaktif`. */
  dinonaktifkanPada: string | null;
}
