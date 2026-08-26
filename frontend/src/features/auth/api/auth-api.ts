import { apiClient } from '@/lib/api-client';
import type { PetugasCredentials, Session } from '../types';

/** Kontrak API autentikasi. Hanya pengurus yang punya akun. */
export interface AuthApi {
  /** Pengurus (Dukuh/RW/RT): username + password. */
  login(credentials: PetugasCredentials): Promise<Session>;
  logout(): Promise<void>;
}

export const authApi: AuthApi = {
  async login(credentials) {
    const { data } = await apiClient.post<Session>('/auth/login', credentials);
    return data;
  },

  async logout() {
    await apiClient.post('/auth/logout');
  },
};
