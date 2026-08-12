/**
 * Pintu masuk publik data mock.
 *
 * File JSON di `src/mocks/data/` **hanya boleh diimpor dari dalam folder ini**.
 * Konsumen di luar `src/mocks/` mengimpor dari `@/mocks`, sehingga bentuk
 * penyimpanan mock bisa berubah tanpa menyentuh kode fitur.
 */

import pengurusJson from './data/pengurus.json';
import type { MockPengurus } from './types';

export type { JabatanPengurus, MockPengurus, StatusPengurus } from './types';

/**
 * Akun pengurus untuk menguji mekanisme masa berlaku akun.
 *
 * Seluruh `nama` dan `username` **fiktif**. Data pengurus sungguhan tidak
 * pernah masuk ke file yang di-commit — hanya ke database produksi.
 *
 * Assertion di bawah diperlukan karena TypeScript melebarkan literal di JSON
 * menjadi `string`, sehingga `jabatan` & `status` kehilangan tipe union-nya.
 * Ini satu-satunya tempat JSON tersebut disentuh, jadi cukup dijaga di sini.
 */
export const mockPengurus = pengurusJson as MockPengurus[];
