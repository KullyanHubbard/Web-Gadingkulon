import { useMemo, useState } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import type { FilterPenduduk } from '../types';
import { useFilterOpsi, usePendudukList } from '../hooks/use-penduduk';
import type { Penduduk } from '../types';
import { toPendudukDetail, toPendudukRow } from '../view-model';
import { WargaFormDialog } from './WargaFormDialog';
import { DaftarPendudukView, type PaginasiView } from './DaftarPendudukView';

const PAGE_SIZE = 8;

/**
 * Daftar penduduk untuk pengurus: pencarian nama, filter kategori, paginasi,
 * dan pemilihan detail.
 *
 * Seluruh state layar dan turunannya berhenti di sini; `DaftarPendudukView`
 * hanya menerima nilai yang sudah jadi.
 */
export function DaftarPenduduk() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterPenduduk>({});
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formTarget, setFormTarget] = useState<Penduduk | 'baru' | null>(null);

  const debouncedSearch = useDebounce(search);
  const { data: filterOpsi } = useFilterOpsi();

  const params = useMemo(
    () => ({ page, pageSize: PAGE_SIZE, search: debouncedSearch, ...filter }),
    [page, debouncedSearch, filter],
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

  function onFilterChange(next: FilterPenduduk) {
    setFilter(next);
    // Wajib: mengubah filter di halaman 5 akan menghasilkan daftar kosong yang
    // terlihat seperti bug, padahal datanya cuma tinggal satu halaman.
    setPage(1);
  }

  function onUbah(id: string) {
    const warga = data?.items.find((p) => p.id === id);
    if (warga) setFormTarget(warga);
  }

  return (
    <>
      <DaftarPendudukView
        search={search}
        onSearchChange={onSearchChange}
        filter={filter}
        filterOpsi={filterOpsi}
        onFilterChange={onFilterChange}
        isLoading={isLoading}
        isError={isError}
        rows={rows}
        paginasi={paginasi}
        onPrev={() => setPage((p) => Math.max(1, p - 1))}
        onNext={() => setPage((p) => p + 1)}
        onPilih={(row) => setSelectedId(row.id)}
        detail={detail}
        onTutupDetail={() => setSelectedId(null)}
        onTambah={() => setFormTarget('baru')}
        onUbah={onUbah}
      />
      <WargaFormDialog
        target={formTarget}
        onClose={() => setFormTarget(null)}
      />
    </>
  );
}
