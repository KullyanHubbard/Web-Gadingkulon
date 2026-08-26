import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { QueryBoundary } from '@/components/ui/QueryBoundary';
import { Table, Td, Th } from '@/components/ui/Table';
import type { Kursi } from '../types';

interface DaftarKursiViewProps {
  isLoading: boolean;
  isError: boolean;
  kursi: Kursi[] | undefined;
  sedangMengubah: boolean;
  onIsiKursi: (kursi: Kursi) => void;
  onResetPassword: (kursi: Kursi) => void;
  onCabutAkses: (kursi: Kursi) => void;
}

/** Tabel kursi padukuhan beserta aksinya. Tampilan saja. */
export function DaftarKursiView({
  isLoading,
  isError,
  kursi,
  sedangMengubah,
  onIsiKursi,
  onResetPassword,
  onCabutAkses,
}: DaftarKursiViewProps) {
  return (
    <Card>
      <CardHeader
        title="Kursi Pengurus"
        description="Daftar jabatan mengikuti RW & RT yang ada di data warga."
      />
      <CardContent className="p-0">
        <QueryBoundary
          isLoading={isLoading}
          isError={isError}
          data={kursi}
          errorMessage="Gagal memuat daftar kursi pengurus."
        >
          {(daftar) => (
            <Table>
              <thead>
                <tr>
                  <Th>Kursi</Th>
                  <Th>Nama Penghuni</Th>
                  <Th>Username</Th>
                  <Th>Status</Th>
                  <Th>Aksi</Th>
                </tr>
              </thead>
              <tbody>
                {daftar.map((k) => (
                  <tr key={k.kursi} className="hover:bg-slate-50">
                    <Td className="font-medium text-slate-900">{k.jabatan}</Td>
                    <Td>{k.penghuni?.nama ?? '—'}</Td>
                    <Td className="text-xs">{k.penghuni?.username ?? '—'}</Td>
                    <Td>
                      {k.penghuni ? (
                        <Badge
                          tone={k.penghuni.harusGantiPassword ? 'amber' : 'green'}
                        >
                          {k.penghuni.harusGantiPassword
                            ? 'Belum ganti password'
                            : 'Aktif'}
                        </Badge>
                      ) : (
                        <Badge tone="slate">Kosong</Badge>
                      )}
                    </Td>
                    <Td>
                      {k.penghuni ? (
                        <div className="flex items-center gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onResetPassword(k)}
                          >
                            Reset Password
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            disabled={sedangMengubah}
                            onClick={() => onCabutAkses(k)}
                          >
                            Cabut Akses
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" onClick={() => onIsiKursi(k)}>
                          Buatkan Akun
                        </Button>
                      )}
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
