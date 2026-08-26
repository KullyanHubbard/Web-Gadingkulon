import { History } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { QueryBoundary } from '@/components/ui/QueryBoundary';
import { Table, Td, Th } from '@/components/ui/Table';
import type { BarisRiwayat } from '../view-model';

interface RiwayatViewProps {
  isLoading: boolean;
  isError: boolean;
  baris: BarisRiwayat[] | undefined;
  kosongJudul: string;
  kosongKeterangan: string;
}

/** Tabel riwayat perubahan. Tampilan saja. */
export function RiwayatView({
  isLoading,
  isError,
  baris,
  kosongJudul,
  kosongKeterangan,
}: RiwayatViewProps) {
  return (
    <Card>
      <CardContent className="p-0">
        <QueryBoundary
          isLoading={isLoading}
          isError={isError}
          data={baris}
          isEmpty={(b) => b.length === 0}
          errorMessage="Gagal memuat riwayat perubahan."
          empty={
            <EmptyState
              icon={History}
              title={kosongJudul}
              description={kosongKeterangan}
            />
          }
        >
          {(daftar) => (
            <Table>
              <thead>
                <tr>
                  <Th>Waktu</Th>
                  <Th>Oleh</Th>
                  <Th>Tindakan</Th>
                  <Th>Yang diubah</Th>
                </tr>
              </thead>
              <tbody>
                {daftar.map((b) => (
                  <tr key={b.id} className="align-top hover:bg-slate-50">
                    <Td className="whitespace-nowrap text-xs text-slate-500">
                      {b.waktu}
                      <br />
                      {b.jam}
                    </Td>
                    <Td className="whitespace-nowrap text-sm">{b.aktor}</Td>
                    <Td className="text-sm">
                      <span className="font-medium text-slate-900">
                        {b.aksi}
                      </span>
                      <br />
                      <span className="text-slate-600">{b.sasaran}</span>
                    </Td>
                    <Td className="text-sm">
                      {b.perubahan.length === 0 && !b.catatan && (
                        <span className="text-slate-400">—</span>
                      )}
                      {b.catatan && (
                        <span className="text-slate-600">{b.catatan}</span>
                      )}
                      <ul className="space-y-0.5">
                        {b.perubahan.map((p) => (
                          <li key={p.kolom}>
                            <span className="text-slate-500">{p.kolom}: </span>
                            <span className="text-slate-500 line-through">
                              {p.lama || '(kosong)'}
                            </span>{' '}
                            <span aria-hidden>→</span>{' '}
                            <span className="font-medium text-slate-900">
                              {p.baru || '(kosong)'}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </QueryBoundary>
      </CardContent>
    </Card>
  );
}
