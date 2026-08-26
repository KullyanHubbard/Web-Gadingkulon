import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { QueryBoundary } from '@/components/ui/QueryBoundary';
import { Table, Td, Th } from '@/components/ui/Table';
import type { FilterOpsi, FilterPenduduk } from '@/types/penduduk';
import type {
  PendudukDetailView as PendudukDetailData,
  PendudukRow,
} from '../view-model';
import { FilterPendudukBar } from './FilterPendudukBar';
import { PendudukDetailView } from './PendudukDetailView';

/** Keterangan paginasi yang sudah dihitung container. */
export interface PaginasiView {
  /** mis. "1–8 dari 42" */
  ringkasan: string;
  halaman: number;
  totalHalaman: number;
  bisaMundur: boolean;
  bisaMaju: boolean;
  /** Query lama masih tampil sementara yang baru dimuat. */
  sedangMenyegarkan: boolean;
}

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
              <Table>
                <thead>
                  <tr>
                    <Th>Nama</Th>
                    <Th>L/P</Th>
                    <Th>Umur</Th>
                    <Th>Agama</Th>
                    <Th>Aksi</Th>
                  </tr>
                </thead>
                <tbody>
                  {daftar.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <Td className="font-medium text-slate-900">{row.nama}</Td>
                      <Td>
                        <Badge tone={row.jenisKelaminTone}>
                          {row.jenisKelamin}
                        </Badge>
                      </Td>
                      <Td>{row.umur}</Td>
                      <Td>{row.agama}</Td>
                      <Td>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onPilih(row)}
                        >
                          Detail
                        </Button>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </QueryBoundary>
        </CardContent>

        {paginasi && (
          <div className="flex items-center justify-between px-5 py-3 text-sm text-slate-500">
            <span>
              {paginasi.ringkasan}
              {paginasi.sedangMenyegarkan && ' · memperbarui…'}
            </span>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                disabled={!paginasi.bisaMundur}
                onClick={onPrev}
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-2">
                {paginasi.halaman} / {paginasi.totalHalaman}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={!paginasi.bisaMaju}
                onClick={onNext}
                aria-label="Halaman berikutnya"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
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
