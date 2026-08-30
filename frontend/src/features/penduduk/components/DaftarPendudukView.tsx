import { Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { QueryBoundary } from '@/components/ui/QueryBoundary';
import type { FilterOpsi, FilterPenduduk } from '../types';
import type {
  PendudukDetailView as PendudukDetailData,
  PendudukRow,
} from '../view-model';
import { FilterPendudukBar } from './FilterPendudukBar';
import { PaginasiPenduduk, type PaginasiView } from './PaginasiPenduduk';
import { PendudukDetailView } from './PendudukDetailView';
import { TabelPenduduk } from './TabelPenduduk';

export type { PaginasiView };

interface DaftarPendudukViewProps {
  search: string;
  onSearchChange: (value: string) => void;
  filter: FilterPenduduk;
  filterOpsi: FilterOpsi | undefined;
  onFilterChange: (next: FilterPenduduk) => void;
  isLoading: boolean;
  isError: boolean;
  rows: PendudukRow[] | undefined;
  paginasi: PaginasiView | null;
  onPrev: () => void;
  onNext: () => void;
  onPilih: (row: PendudukRow) => void;
  detail: PendudukDetailData | null;
  onTutupDetail: () => void;
  onTambah: () => void;
  onUbah: (id: string) => void;
}

/** Tabel daftar penduduk + pencarian + paginasi. Tampilan saja. */
export function DaftarPendudukView({
  search,
  onSearchChange,
  filter,
  filterOpsi,
  onFilterChange,
  isLoading,
  isError,
  rows,
  paginasi,
  onPrev,
  onNext,
  onPilih,
  detail,
  onTutupDetail,
  onTambah,
  onUbah,
}: DaftarPendudukViewProps) {
  return (
    <>
      <Card>
        <CardContent className="space-y-4 border-b border-slate-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Cari nama warga…"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
          <FilterPendudukBar
            value={filter}
            opsi={filterOpsi}
            onChange={onFilterChange}
          />

          <div className="flex justify-end">
            <Button size="sm" onClick={onTambah}>
              + Tambah Warga
            </Button>
          </div>
        </CardContent>

        <CardContent className="p-0">
          <QueryBoundary
            isLoading={isLoading}
            isError={isError}
            data={rows}
            isEmpty={(r) => r.length === 0}
            errorMessage="Gagal memuat data penduduk. Silakan muat ulang halaman."
            empty={
              <EmptyState
                icon={Search}
                title="Tidak ada data"
                description="Tidak ada penduduk yang cocok dengan pencarian dan filter Anda."
              />
            }
          >
            {(daftar) => (
              <TabelPenduduk rows={daftar} onPilih={onPilih} onUbah={onUbah} />
            )}
          </QueryBoundary>
        </CardContent>

        {paginasi && (
          <PaginasiPenduduk
            paginasi={paginasi}
            onPrev={onPrev}
            onNext={onNext}
          />
        )}
      </Card>

      <Modal
        open={Boolean(detail)}
        onClose={onTutupDetail}
        title="Detail Penduduk"
      >
        {detail && <PendudukDetailView detail={detail} />}
      </Modal>
    </>
  );
}
