import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Table, Td, Th } from '@/components/ui/Table';
import type { KartuKeluargaView as KartuKeluargaData } from '../view-model';

/**
 * Ringkasan satu Kartu Keluarga beserta daftar anggotanya.
 *
 * Menerima data hasil `toKartuKeluargaView`; seluruh sel di bawah sudah berupa
 * string siap cetak.
 */
export function KartuKeluargaCardView({ kk }: { kk: KartuKeluargaData }) {
  return (
    <Card>
      <CardHeader
        title={kk.judul}
        description={`No. KK ${kk.noKK}`}
        action={<Badge tone="slate">{kk.jumlahAnggota}</Badge>}
      />
      <CardContent className="p-0">
        <Table>
          <thead>
            <tr>
              <Th>Nama</Th>
              <Th>NIK</Th>
              <Th>Hubungan</Th>
              <Th>L/P</Th>
              <Th>Umur</Th>
            </tr>
          </thead>
          <tbody>
            {kk.anggota.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50">
                <Td className="font-medium text-slate-900">{a.nama}</Td>
                <Td className="text-xs tabular-nums">{a.nik}</Td>
                <Td>{a.hubungan}</Td>
                <Td>{a.jenisKelamin}</Td>
                <Td>{a.umur}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </CardContent>
    </Card>
  );
}
