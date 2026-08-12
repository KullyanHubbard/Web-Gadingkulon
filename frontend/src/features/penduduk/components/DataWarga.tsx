import { useKartuKeluarga, usePendudukByNik } from '../hooks/use-penduduk';
import { toKartuKeluargaView, toPendudukDetail } from '../view-model';
import { DataWargaView } from './DataWargaView';

/**
 * Data kependudukan satu warga beserta anggota Kartu Keluarganya.
 *
 * Menerima NIK sebagai prop — bukan membaca sesi sendiri — supaya fitur
 * penduduk tetap tidak bergantung pada fitur auth (CLAUDE.md §4).
 */
export function DataWarga({ nik }: { nik: string }) {
  const pendudukQuery = usePendudukByNik(nik);
  const penduduk = pendudukQuery.data;

  const kkQuery = useKartuKeluarga(penduduk?.noKK ?? '', Boolean(penduduk));

  return (
    <DataWargaView
      nik={nik}
      isLoading={pendudukQuery.isLoading}
      isError={pendudukQuery.isError}
      detail={penduduk ? toPendudukDetail(penduduk) : penduduk}
      kk={kkQuery.data ? toKartuKeluargaView(kkQuery.data) : undefined}
      kkGagal={kkQuery.isError}
    />
  );
}
