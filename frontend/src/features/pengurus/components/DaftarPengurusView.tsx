import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { QueryBoundary } from '@/components/ui/QueryBoundary';
import { Table, Td, Th } from '@/components/ui/Table';
import type { Pengurus } from '../types';

interface DaftarPengurusViewProps {
  isLoading: boolean;
  isError: boolean;
  daftar: Pengurus[] | undefined;
  /** Akun yang sedang dipakai — tidak boleh menonaktifkan diri sendiri. */
  idSaya: string | undefined;
  sedangMengubah: boolean;
  onToggleAktif: (akun: Pengurus) => void;
  onResetPassword: (akun: Pengurus) => void;
}

/** Tabel akun pengurus beserta aksinya. Tampilan saja. */
export function DaftarPengurusView({
  isLoading,
  isError,
  daftar,
  idSaya,
  sedangMengubah,
  onToggleAktif,
  onResetPassword,
}: DaftarPengurusViewProps) {
  return (
    <Card>
      <CardHeader
        title="Akun Pengurus"
        description="Akun tidak pernah dihapus, cukup dinonaktifkan."
      />
      <CardContent className="p-0">
        <QueryBoundary
          isLoading={isLoading}
          isError={isError}
          data={daftar}
          errorMessage="Gagal memuat daftar akun pengurus."
        >
          {(akun) => (
            <Table>
              <thead>
                <tr>
                  <Th>Nama</Th>
                  <Th>Username</Th>
                  <Th>Jabatan</Th>
                  <Th>Status</Th>
                  <Th>Aksi</Th>
                </tr>
              </thead>
              <tbody>
                {akun.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <Td className="font-medium text-slate-900">{p.nama}</Td>
                    <Td className="text-xs">{p.username}</Td>
                    <Td>{p.jabatan}</Td>
                    <Td>
                      <Badge tone={p.aktif ? 'green' : 'red'}>
                        {p.aktif ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onResetPassword(p)}
                        >
                          Reset Password
                        </Button>
                        <Button
                          size="sm"
                          variant={p.aktif ? 'danger' : 'outline'}
                          disabled={sedangMengubah || p.id === idSaya}
                          title={
                            p.id === idSaya
                              ? 'Tidak bisa menonaktifkan akun Anda sendiri.'
                              : undefined
                          }
                          onClick={() => onToggleAktif(p)}
                        >
                          {p.aktif ? 'Nonaktifkan' : 'Aktifkan'}
                        </Button>
                      </div>
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
