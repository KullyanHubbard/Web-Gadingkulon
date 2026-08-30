import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table, Td, Th } from '@/components/ui/Table';
import type { PendudukRow } from '../view-model';

interface TabelPendudukProps {
  rows: PendudukRow[];
  onPilih: (row: PendudukRow) => void;
  onUbah: (id: string) => void;
}

/** Tabel warga. Barisnya sudah siap tampil — pemformatan ada di `view-model`. */
export function TabelPenduduk({ rows, onPilih, onUbah }: TabelPendudukProps) {
  return (
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
        {rows.map((row) => (
          <tr key={row.id} className="hover:bg-slate-50">
            <Td className="font-medium text-slate-900">
              {row.nama}
              {row.statusTidakAktif && (
                <Badge tone="slate" className="ml-2">
                  {row.statusTidakAktif}
                </Badge>
              )}
            </Td>
            <Td>
              <Badge tone={row.jenisKelaminTone}>{row.jenisKelamin}</Badge>
            </Td>
            <Td>{row.umur}</Td>
            <Td>{row.agama}</Td>
            <Td>
              <div className="flex items-center gap-1">
                <Button size="sm" variant="ghost" onClick={() => onPilih(row)}>
                  Detail
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onUbah(row.id)}
                >
                  Ubah
                </Button>
              </div>
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
}
