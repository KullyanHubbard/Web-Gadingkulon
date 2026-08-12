import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/types/api';

/**
 * Konfigurasi global React Query.
 * - Tidak retry pada error 4xx (kesalahan klien, retry percuma).
 * - staleTime 60 detik agar tidak refetch berlebihan.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (
          error instanceof ApiError &&
          error.status >= 400 &&
          error.status < 500
        ) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});
