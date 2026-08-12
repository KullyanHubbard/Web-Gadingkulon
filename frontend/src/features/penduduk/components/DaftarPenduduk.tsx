import { useMemo, useState, type ReactNode } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { usePendudukList } from '../hooks/use-penduduk';
import {
  toPendudukDetail,
  toPendudukRow,
  type PendudukRow,
} from '../view-model';
import { DaftarPendudukView, type PaginasiView } from './DaftarPendudukView';

const PAGE_SIZE = 8;

interface DaftarPendudukProps {
  /**
   * Aksi tambahan per baris. Disuntik dari luar supaya fitur penduduk tidak
   * perlu mengenal fitur lain (mis. tombol Reset PIN milik fitur auth).
   */
  renderAksi?: (row: PendudukRow) => ReactNode;
}

/**
 * Daftar penduduk untuk pengurus: pencarian, paginasi, dan pemilihan detail.
 *
 * Seluruh state layar dan turunannya berhenti di sini; `DaftarPendudukView`
 * hanya menerima nilai yang sudah jadi.
 */
export function DaftarPenduduk({ renderAksi }: DaftarPendudukProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search);

  const params = useMemo(
    () => ({ page, pageSize: PAGE_SIZE, search: debouncedSearch }),
    [page, debouncedSearch],
  );
  const { data, isLoading, isError, isFetching } = usePendudukList(params);

  const rows = useMemo(() => data?.items.map(toPendudukRow), [data]);

  const detail = useMemo(() => {
    const terpilih = data?.items.find((p) => p.id === selectedId);
    return terpilih ? toPendudukDetail(terpilih) : null;
  }, [data, selectedId]);

  const paginasi: PaginasiView | null = useMemo(() => {
    if (!data || data.total === 0) return null;
    const totalHalaman = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
    const dari = (page - 1) * PAGE_SIZE + 1;
    const sampai = Math.min(page * PAGE_SIZE, data.total);
    return {
      ringkasan: `${dari}–${sampai} dari ${data.total}`,
      halaman: page,
      totalHalaman,
      bisaMundur: page > 1,
      bisaMaju: page < totalHalaman,
      sedangMenyegarkan: isFetching,
    };
  }, [data, page, isFetching]);

  function onSearchChange(value: string) {
    setSearch(value);
    setPage(1); // reset ke halaman awal saat query berubah
  }

  return (
    <DaftarPendudukView
      search={search}
      onSearchChange={onSearchChange}
      isLoading={isLoading}
      isError={isError}
      rows={rows}
      paginasi={paginasi}
      onPrev={() => setPage((p) => Math.max(1, p - 1))}
      onNext={() => setPage((p) => p + 1)}
      renderAksi={renderAksi}
      onPilih={(row) => setSelectedId(row.id)}
      detail={detail}
      onTutupDetail={() => setSelectedId(null)}
    />
  );
}
