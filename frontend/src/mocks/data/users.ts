import type { AuthUser } from '@/features/auth/types';

/**
 * Akun demo untuk mode mock.
 * PIN & password ditulis polos di sini HANYA untuk simulasi tanpa backend.
 * Di produksi keduanya di-hash oleh FastAPI — jangan pernah menyimpan
 * kredensial di frontend.
 */

/** Akun pengurus (Dukuh / RW / RT). Semuanya berperan ADMIN. */
export interface MockPetugasAccount {
  password: string;
  user: AuthUser;
}

export const mockPetugasAccounts: MockPetugasAccount[] = [
  {
    password: 'dukuh123',
    user: {
      id: 'u-dukuh-1',
      nama: 'Bambang Sutrisno',
      username: 'dukuh',
      role: 'ADMIN',
      nik: '3204121705850001',
      jabatan: 'Dukuh',
    },
  },
  {
    password: 'rt123',
    user: {
      id: 'u-rt-03',
      nama: 'Fajar Nugraha',
      username: 'rt03',
      role: 'ADMIN',
      nik: '3204122208900010',
      jabatan: 'Ketua RT 03',
    },
  },
];

/**
 * Akun warga di mode mock, dikunci per NIK.
 *
 * Kondisi nyata: seluruh NIK SUDAH ada di data kependudukan, tapi belum ada
 * satu pun akun sampai warga mengaktifkannya sendiri lewat NIK + tanggal lahir.
 * NIK yang tidak ada di map ini berarti belum pernah diaktivasi.
 *
 * Satu entri di-seed dalam keadaan sudah aktif supaya alur login bisa diuji
 * tanpa harus aktivasi lebih dulu.
 */
export interface MockWargaAccount {
  nik: string;
  pin: string;
  noHp?: string;
  email?: string;
}

const wargaAccounts = new Map<string, MockWargaAccount>([
  // Dedi Kurniawan — sudah aktif, untuk menguji login NIK + PIN.
  ['3204120208790004', { nik: '3204120208790004', pin: '112233' }],
  // Warga lain (mis. Haji Suparman 3204120101600008, lahir 1960-01-01)
  // sengaja dibiarkan kosong untuk menguji alur aktivasi.
]);

export function findWargaAccount(nik: string): MockWargaAccount | undefined {
  return wargaAccounts.get(nik);
}

export function simpanWargaAccount(account: MockWargaAccount): void {
  wargaAccounts.set(account.nik, account);
}

/** Reset PIN oleh admin: akun dihapus sehingga warga wajib aktivasi ulang. */
export function hapusWargaAccount(nik: string): void {
  wargaAccounts.delete(nik);
}
