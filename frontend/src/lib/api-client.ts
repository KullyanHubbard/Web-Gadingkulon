import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import { env } from '@/config/env';
import { ApiError } from '@/types/api';
import { getStoredToken, clearSession } from '@/features/auth/token-storage';

/** Instance HTTP tunggal untuk memanggil FastAPI. */
export const apiClient: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
});

// Sisipkan bearer token ke setiap request bila ada sesi aktif.
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredToken();
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Normalisasi error menjadi ApiError + auto-logout saat 401.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 0;
      const data = error.response?.data as { message?: string } | undefined;
      const message =
        data?.message ?? error.message ?? 'Terjadi kesalahan jaringan';

      if (status === 401) {
        clearSession();
      }
      return Promise.reject(
        new ApiError(status, message, error.response?.data),
      );
    }
    return Promise.reject(new ApiError(0, 'Kesalahan tak terduga', error));
  },
);
