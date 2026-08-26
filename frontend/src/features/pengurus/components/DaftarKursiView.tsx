import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { QueryBoundary } from '@/components/ui/QueryBoundary';
import { Table, Td, Th } from '@/components/ui/Table';
import ikonKeyRound from '@/assets/icons/nav/key-round.svg';
import type { Kursi } from '../types';

interface DaftarKursiViewProps {
  isLoading: boolean;
  isError: boolean;
  kursi: Kursi[] | undefined;
  sedangMengubah: boolean;
  onIsiKursi: (kursi: Kursi) => void;
  onResetPassword: (kursi: Kursi) => void;
  onAjukanPergantian: (kursi: Kursi) => void;
}

/** Tabel kursi padukuhan beserta aksinya. Tampilan saja. */
export function DaftarKursiView({
  isLoading,
  isError,
  kursi,
  sedangMengubah,
  onIsiKursi,
  onResetPassword,
  onAjukanPergantian,
}: DaftarKursiViewProps) {
  return (
    <Card className="overflow-hidden shadow-sm border-slate-200">
      <CardHeader title="Daftar Akun" />
      <CardContent className="p-0">
        <QueryBoundary
          isLoading={isLoading}
          isError={isError}
          data={kursi}
          errorMessage="Gagal memuat daftar akun pengurus."
        >
          {(daftar) => (
            <Table>
              <thead>
                <tr>
                  <Th>Jabatan</Th>
                  <Th>Nama</Th>
                  <Th>Username</Th>
                  <Th>Status</Th>
                  <Th>Aksi</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {daftar.map((k) => (
                  <tr key={k.kursi} className="hover:bg-slate-50/80 transition-colors">
                    <Td className="font-semibold text-slate-900">{k.jabatan}</Td>
                    <Td className="font-medium text-slate-800">
                      {k.penghuni ? (
                        k.penghuni.nama
                      ) : k.calon ? (
                        <span className="text-slate-500 font-normal">
                          {k.calon.nama}{' '}
                          <span className="text-xs text-slate-400">(dari data warga)</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">—</span>
                      )}
                    </Td>
                    <Td className="text-slate-600 font-mono text-xs">
                      {k.penghuni?.username ?? <span className="text-slate-400 font-sans text-sm">—</span>}
                    </Td>
                    <Td>
                      {k.penghuni ? (
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${k.penghuni.harusGantiPassword ? 'bg-amber-400' : 'bg-emerald-500'}`}
                          />
                          <span className="text-sm font-medium text-slate-700">
                            {k.penghuni.harusGantiPassword
                              ? 'Belum ganti password'
                              : 'Aktif'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-slate-300" />
                          <span className="text-sm font-medium text-slate-400">Kosong</span>
                        </div>
                      )}
                    </Td>
                    <Td>
                      {k.penghuni ? (
                        <div className="flex items-center gap-3">
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={sedangMengubah}
                            onClick={() => onAjukanPergantian(k)}
                          >
                            Ajukan Pergantian
                          </Button>
                          <button
                            type="button"
                            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors py-1 px-2 rounded-md hover:bg-slate-100"
                            title="Reset Password"
                            onClick={() => onResetPassword(k)}
                          >
                            <span
                              aria-hidden
                              className="block h-3.5 w-3.5 bg-current"
                              style={{
                                mask: `url("${ikonKeyRound}") center / contain no-repeat`,
                                WebkitMask: `url("${ikonKeyRound}") center / contain no-repeat`,
                              }}
                            />
                            Reset
                          </button>
                        </div>
                      ) : (
                        <Button size="sm" variant="secondary" onClick={() => onIsiKursi(k)}>
                          + Buat Akun
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
