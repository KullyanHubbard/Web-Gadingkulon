import type { ReactNode } from 'react';
import { Alert } from './Alert';
import { EmptyState } from './EmptyState';
import { LoadingBlock } from './Spinner';

interface QueryBoundaryProps<T> {
  isLoading: boolean;
  isError: boolean;
  /** `undefined` = belum ada data, `null` = sudah dicek dan memang tidak ada. */
  data: T | null | undefined;
  /** Data ada tapi kosong, mis. daftar tanpa hasil. */
  isEmpty?: (data: T) => boolean;
  loadingLabel?: string;
  errorMessage?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  /** Ganti seluruh tampilan kosong bila butuh bentuk lain. */
  empty?: ReactNode;
  children: (data: T) => ReactNode;
}

/**
 * Satu tempat untuk empat keadaan sebuah query: memuat, gagal, kosong, ada isi.
 *
 * Sebelumnya tiap halaman menulis rantai ternary-nya sendiri dengan bentuk
 * berbeda-beda — ada yang lupa menangani cabang gagal, sehingga bagian layar
 * hilang diam-diam. Komponen ini murni presentasi: ia tidak tahu apa pun soal
 * React Query, hanya menerima beberapa boolean dan sebuah nilai.
 */
export function QueryBoundary<T>({
  isLoading,
  isError,
  data,
  isEmpty,
  loadingLabel,
  errorMessage = 'Gagal memuat data. Silakan muat ulang halaman.',
  emptyTitle = 'Tidak ada data',
  emptyDescription,
  empty,
  children,
}: QueryBoundaryProps<T>) {
  if (isLoading) return <LoadingBlock label={loadingLabel} />;
  if (isError || data === undefined)
    return <Alert tone="error">{errorMessage}</Alert>;

  if (data === null || isEmpty?.(data)) {
    return (
      <>
        {empty ?? (
          <EmptyState title={emptyTitle} description={emptyDescription} />
        )}
      </>
    );
  }

  return <>{children(data)}</>;
}
