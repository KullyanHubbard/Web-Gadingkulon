import { isMockMode } from '@/config/env';
import { apiClient } from '@/lib/api-client';
import { pendudukData } from '@/mocks/data/penduduk';
import {
  findWargaAccount,
  hapusWargaAccount,
  mockPetugasAccounts,
  simpanWargaAccount,
} from '@/mocks/data/users';
import { delay } from '@/mocks/utils';
import { ApiError } from '@/types/api';
import { getStoredSession } from '../token-storage';
import type {
  AktivasiCek,
  AktivasiTiket,
  AuthUser,
  KontakPayload,
  PetugasCredentials,
  Session,
  SetPinPayload,
  WargaCredentials,
} from '../types';

/** Kontrak API autentikasi — sama untuk mode mock maupun http. */
export interface AuthApi {
  /** Warga: NIK + PIN yang ia tetapkan saat aktivasi. */
  loginWarga(credentials: WargaCredentials): Promise<Session>;
  /** Pengurus (Dukuh/RW/RT): username + password. */
  loginPetugas(credentials: PetugasCredentials): Promise<Session>;
  /** Aktivasi langkah 1 — verifikasi NIK + tanggal lahir, terbitkan tiket. */
  cekAktivasi(payload: AktivasiCek): Promise<AktivasiTiket>;
  /** Aktivasi langkah 2 — tukar tiket dengan PIN baru, langsung dapat sesi. */
  setPin(payload: SetPinPayload): Promise<Session>;
  /** Simpan kontak opsional milik warga yang sedang masuk. */
  simpanKontak(payload: KontakPayload): Promise<AuthUser>;
  /** Reset PIN warga (hanya ADMIN) — warga wajib aktivasi ulang setelahnya. */
  resetPinWarga(nik: string): Promise<void>;
  logout(): Promise<void>;
}

// ---------------------------------------------------------------------------
// Implementasi mock
// ---------------------------------------------------------------------------

type MockPenduduk = (typeof pendudukData)[number];

/** Umur tiket aktivasi. Backend nanti WAJIB menegakkan batas serupa. */
const TIKET_TTL_MS = 10 * 60 * 1000;

const tiketAktif = new Map<string, { nik: string; kedaluwarsa: number }>();

/**
 * Pesan seragam untuk NIK tidak ditemukan MAUPUN tanggal lahir tidak cocok.
 * Disamakan supaya tidak membocorkan NIK mana yang terdaftar.
 */
const PESAN_AKTIVASI_GAGAL =
  'NIK atau tanggal lahir tidak cocok dengan data kependudukan. Periksa kembali, atau hubungi Ketua RT Anda.';

function wargaUser(penduduk: MockPenduduk): AuthUser {
  const akun = findWargaAccount(penduduk.nik);
  return {
    id: `w-${penduduk.nik}`,
    nama: penduduk.nama,
    role: 'USER',
    nik: penduduk.nik,
    noHp: akun?.noHp,
    email: akun?.email,
  };
}

function buatSesi(user: AuthUser): Session {
  return { token: `mock-jwt.${user.id}.${Date.now()}`, user };
}

const mockAuthApi: AuthApi = {
  async loginWarga({ nik, pin }) {
    await delay();
    const akun = findWargaAccount(nik);
    const penduduk = pendudukData.find((p) => p.nik === nik);

    // Pesan sengaja tidak membedakan "NIK salah" dari "PIN salah".
    if (!akun || !penduduk || akun.pin !== pin) {
      throw new ApiError(401, 'NIK atau PIN salah.');
    }
    return buatSesi(wargaUser(penduduk));
  },

  async loginPetugas({ username, password }) {
    await delay();
    const account = mockPetugasAccounts.find(
      (a) => a.user.username === username && a.password === password,
    );
    if (!account) {
      throw new ApiError(401, 'Username atau password salah.');
    }
    return buatSesi(account.user);
  },

  async cekAktivasi({ nik, tanggalLahir }) {
    await delay();
    const penduduk = pendudukData.find((p) => p.nik === nik);

    if (!penduduk || penduduk.tanggalLahir !== tanggalLahir) {
      throw new ApiError(401, PESAN_AKTIVASI_GAGAL);
    }

    // Akun yang sudah aktif tidak boleh diklaim ulang lewat tanggal lahir —
    // kalau tidak, siapa pun yang tahu NIK + tanggal lahir bisa mengambil alih
    // akun warga yang sudah dipakai. Pemulihan hanya lewat reset oleh pengurus.
    if (findWargaAccount(nik)) {
      throw new ApiError(
        409,
        'Akun untuk NIK ini sudah aktif. Silakan masuk dengan PIN Anda. Kalau lupa PIN, hubungi Ketua RT untuk direset.',
      );
    }

    const tiket = `tiket-${nik}-${Date.now()}`;
    tiketAktif.set(tiket, { nik, kedaluwarsa: Date.now() + TIKET_TTL_MS });
    return { tiket, nama: penduduk.nama };
  },

  async setPin({ tiket, pin }) {
    await delay();
    const entri = tiketAktif.get(tiket);

    if (!entri || entri.kedaluwarsa < Date.now()) {
      tiketAktif.delete(tiket);
      throw new ApiError(
        400,
        'Sesi aktivasi sudah kedaluwarsa. Silakan ulangi dari awal.',
      );
    }
    tiketAktif.delete(tiket); // sekali pakai

    const penduduk = pendudukData.find((p) => p.nik === entri.nik);
    if (!penduduk) {
      throw new ApiError(404, 'Data kependudukan tidak ditemukan.');
    }

    simpanWargaAccount({ nik: entri.nik, pin });
    return buatSesi(wargaUser(penduduk));
  },

  async simpanKontak({ noHp, email }) {
    await delay();
    const nik = getStoredSession()?.user.nik;
    const akun = nik ? findWargaAccount(nik) : undefined;
    const penduduk = pendudukData.find((p) => p.nik === nik);

    if (!akun || !penduduk) {
      throw new ApiError(401, 'Sesi Anda sudah berakhir. Silakan masuk lagi.');
    }

    simpanWargaAccount({ ...akun, noHp, email });
    return wargaUser(penduduk);
  },

  async resetPinWarga(nik) {
    await delay();
    if (!findWargaAccount(nik)) {
      throw new ApiError(404, 'Warga ini belum pernah mengaktifkan akun.');
    }
    hapusWargaAccount(nik);
  },

  async logout() {
    await delay(150);
  },
};

// ---------------------------------------------------------------------------
// Implementasi http (FastAPI)
// ---------------------------------------------------------------------------

const httpAuthApi: AuthApi = {
  async loginWarga(credentials) {
    const { data } = await apiClient.post<Session>(
      '/auth/warga/login',
      credentials,
    );
    return data;
  },

  async loginPetugas(credentials) {
    const { data } = await apiClient.post<Session>('/auth/login', credentials);
    return data;
  },

  async cekAktivasi(payload) {
    const { data } = await apiClient.post<AktivasiTiket>(
      '/auth/warga/aktivasi/cek',
      payload,
    );
    return data;
  },

  async setPin(payload) {
    const { data } = await apiClient.post<Session>(
      '/auth/warga/aktivasi/set-pin',
      payload,
    );
    return data;
  },

  async simpanKontak(payload) {
    const { data } = await apiClient.patch<AuthUser>(
      '/auth/me/kontak',
      payload,
    );
    return data;
  },

  async resetPinWarga(nik) {
    await apiClient.post(`/auth/warga/${nik}/reset-pin`);
  },

  async logout() {
    await apiClient.post('/auth/logout');
  },
};

export const authApi: AuthApi = isMockMode ? mockAuthApi : httpAuthApi;
