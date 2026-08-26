import { apiClient } from '@/lib/api-client';
import type {
  AuthUser,
  GantiPassword,
  PetugasCredentials,
  Session,
} from '../types';

/** Kontrak API autentikasi. Hanya pengurus yang punya akun. */
export interface AuthApi {
  /** Perangkat desa: username + password. */
  login(credentials: PetugasCredentials): Promise<Session>;
  /** Ganti password sendiri — satu-satunya aksi yang terbuka selagi
   *  `harusGantiPassword` menyala. */
  gantiPassword(payload: GantiPassword): Promise<AuthUser>;
  logout(tokenOverride?: string): Promise<void>;
}

export const authApi: AuthApi = {
  async login(credentials) {
    const { data } = await apiClient.post<Session>('/auth/login', credentials);
    return data;
  },

  async gantiPassword(payload) {
    const { data } = await apiClient.post<AuthUser>(
      '/auth/ganti-password',
      payload,
    );
    return data;
  },

  async logout(tokenOverride) {
    const config = tokenOverride
      ? { headers: { Authorization: `Bearer ${tokenOverride}` } }
      : undefined;
    await apiClient.post('/auth/logout', undefined, config);
  },
};
