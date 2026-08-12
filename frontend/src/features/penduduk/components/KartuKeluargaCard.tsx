import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, Td, Th } from '@/components/ui/Table';
import type { KartuKeluarga } from '../types';
import { jenisKelaminLabel, statusHubunganLabel } from '../labels';
import { hitungUmur } from '../utils';

/** Ringkasan satu Kartu Keluarga beserta daftar anggotanya. */
export function KartuKeluargaCard({ kk }: { kk: KartuKeluarga }) {
  return (
    <Card>
      <CardHeader
        title={`Kartu Keluarga · ${kk.kepalaKeluarga}`}
        description={`No. KK ${kk.noKK}`}
        action={<Badge tone="slate">{kk.anggota.length} anggota</Badge>}
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
                <Td className="font-mono text-xs">{a.nik}</Td>
                <Td>{statusHubunganLabel[a.statusHubunganKeluarga]}</Td>
                <Td>{jenisKelaminLabel[a.jenisKelamin]}</Td>
                <Td>{hitungUmur(a.tanggalLahir)} th</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </CardContent>
    </Card>
  );
}
