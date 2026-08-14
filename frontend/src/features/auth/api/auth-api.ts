import { apiClient } from '@/lib/api-client';
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

/** Kontrak API autentikasi. */
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

export const authApi: AuthApi = {
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
