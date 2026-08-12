import { Alert } from '@/components/ui/Alert';
import { QueryBoundary } from '@/components/ui/QueryBoundary';
import type {
  KartuKeluargaView as KartuKeluargaData,
  PendudukDetailView as PendudukDetailData,
} from '../view-model';
import { KartuKeluargaCardView } from './KartuKeluargaCardView';
import { PendudukDetailView } from './PendudukDetailView';

interface DataWargaViewProps {
  nik: string;
  isLoading: boolean;
  isError: boolean;
  /** `null` = NIK tidak ada di data kependudukan, `undefined` = belum termuat. */
  detail: PendudukDetailData | null | undefined;
  kk: KartuKeluargaData | undefined;
  /** Pengambilan kartu keluarga gagal — data pribadi tetap ditampilkan. */
  kkGagal: boolean;
}

/** Data pribadi warga + kartu keluarganya. Tampilan saja. */
export function DataWargaView({
  nik,
  isLoading,
  isError,
  detail,
  kk,
  kkGagal,
}: DataWargaViewProps) {
  return (
    <QueryBoundary
      isLoading={isLoading}
      isError={isError}
      data={detail}
      loadingLabel="Memuat data Anda…"
      errorMessage="Gagal memuat data. Silakan muat ulang halaman."
      emptyTitle="Data tidak ditemukan"
      emptyDescription={`Tidak ada data kependudukan untuk NIK ${nik}. Hubungi perangkat desa.`}
    >
      {(d) => (
        <div className="space-y-6">
          <PendudukDetailView detail={d} />
          {kkGagal ? (
            <Alert tone="error">
              Data kartu keluarga gagal dimuat. Data pribadi Anda di atas tetap
              benar — muat ulang halaman untuk mencoba lagi.
            </Alert>
          ) : (
            kk && <KartuKeluargaCardView kk={kk} />
          )}
        </div>
      )}
    </QueryBoundary>
  );
}
