import { useMemo, useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Table, Td, Th } from '@/components/ui/Table';
import { LoadingBlock } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { useDebounce } from '@/hooks/use-debounce';
import { ResetPinButton } from '@/features/auth/components/ResetPinButton';
import { usePendudukList } from '@/features/penduduk/hooks/use-penduduk';
import { PendudukDetail } from '@/features/penduduk/components/PendudukDetail';
import { agamaLabel, jenisKelaminLabel } from '@/features/penduduk/labels';
import { hitungUmur } from '@/features/penduduk/utils';
import type { Penduduk } from '@/features/penduduk/types';

const PAGE_SIZE = 8;

export default function PendudukPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Penduduk | null>(null);

  const debouncedSearch = useDebounce(search);

  const params = useMemo(
    () => ({ page, pageSize: PAGE_SIZE, search: debouncedSearch }),
    [page, debouncedSearch],
  );
  const { data, isLoading, isFetching } = usePendudukList(params);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  function onSearchChange(value: string) {
    setSearch(value);
    setPage(1); // reset ke halaman awal saat query berubah
  }

  return (
    <div>
      <PageHeader
        title="Data Penduduk"
        description="Seluruh data kependudukan Desa Sukamaju."
      />

      <Card>
        <CardContent className="border-b border-slate-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Cari nama, NIK, atau No. KK…"
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </CardContent>

        <CardContent className="p-0">
          {isLoading ? (
            <LoadingBlock />
          ) : !data || data.items.length === 0 ? (
            <EmptyState
              icon={Search}
              title="Tidak ada data"
              description="Tidak ada penduduk yang cocok dengan pencarian Anda."
            />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Nama</Th>
                  <Th>NIK</Th>
                  <Th>L/P</Th>
                  <Th>Umur</Th>
                  <Th>Agama</Th>
                  <Th>Aksi</Th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <Td className="font-medium text-slate-900">{p.nama}</Td>
                    <Td className="font-mono text-xs">{p.nik}</Td>
                    <Td>
                      <Badge
                        tone={
                          p.jenisKelamin === 'LAKI_LAKI' ? 'brand' : 'amber'
                        }
                      >
                        {jenisKelaminLabel[p.jenisKelamin]}
                      </Badge>
                    </Td>
                    <Td>{hitungUmur(p.tanggalLahir)} th</Td>
                    <Td>{agamaLabel[p.agama]}</Td>
                    <Td>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelected(p)}
                        >
                          Detail
                        </Button>
                        <ResetPinButton nik={p.nik} nama={p.nama} />
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </CardContent>

        {data && data.total > 0 && (
          <div className="flex items-center justify-between px-5 py-3 text-sm text-slate-500">
            <span>
              {(page - 1) * PAGE_SIZE + 1}–
              {Math.min(page * PAGE_SIZE, data.total)} dari {data.total}
              {isFetching && ' · memperbarui…'}
            </span>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="px-2">
                {page} / {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <Modal
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        title="Detail Penduduk"
      >
        {selected && <PendudukDetail penduduk={selected} />}
      </Modal>
    </div>
  );
}
