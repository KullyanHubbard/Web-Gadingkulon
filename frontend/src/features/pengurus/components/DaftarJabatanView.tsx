import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { QueryBoundary } from '@/components/ui/QueryBoundary';
import { Table, Td, Th } from '@/components/ui/Table';
import ikonKeyRound from '@/assets/icons/nav/key-round.svg';
import type { Jabatan } from '../types';

interface DaftarJabatanViewProps {
  isLoading: boolean;
  isError: boolean;
  jabatan: Jabatan[] | undefined;
  sedangMengubah: boolean;
  onIsiJabatan: (jabatan: Jabatan) => void;
  onResetPassword: (jabatan: Jabatan) => void;
  onAjukanPergantian: (jabatan: Jabatan) => void;
  /** `undefined` selagi struktur organisasi belum selesai dimuat. */
  lpmNama: string | null | undefined;
  onUbahLpm: () => void;
}

/** Tabel jabatan padukuhan beserta aksinya. Tampilan saja. */
export function DaftarJabatanView({
  isLoading,
  isError,
  jabatan,
  sedangMengubah,
  onIsiJabatan,
  onResetPassword,
  onAjukanPergantian,
  lpmNama,
  onUbahLpm,
}: DaftarJabatanViewProps) {
  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm">
      <CardHeader title="Daftar Akun" />
      <CardContent className="p-0">
        <QueryBoundary
          isLoading={isLoading}
          isError={isError}
          data={jabatan}
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
                {daftar.map((j) => (
                  <tr
                    key={j.kode}
                    className="transition-colors hover:bg-slate-50/80"
                  >
                    <Td className="font-semibold text-slate-900">{j.label}</Td>
                    <Td className="font-medium text-slate-800">
                      {j.pemegang ? (
                        j.pemegang.nama
                      ) : j.calon ? (
                        <span className="font-normal text-slate-500">
                          {j.calon.nama}{' '}
                          <span className="text-xs text-slate-400">
                            (dari data warga)
                          </span>
                        </span>
                      ) : (
                        <span className="font-normal text-slate-400">—</span>
                      )}
                    </Td>
                    <Td className="font-mono text-xs text-slate-600">
                      {j.pemegang?.username ?? (
                        <span className="font-sans text-sm text-slate-400">
                          —
                        </span>
                      )}
                    </Td>
                    <Td>
                      {j.pemegang ? (
                        <div className="flex items-center gap-2">
                          <span
                            className={`h-2 w-2 rounded-full ${j.pemegang.harusGantiPassword ? 'bg-amber-400' : 'bg-emerald-500'}`}
                          />
                          <span className="text-sm font-medium text-slate-700">
                            {j.pemegang.harusGantiPassword
                              ? 'Belum ganti password'
                              : 'Aktif'}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-slate-300" />
                          <span className="text-sm font-medium text-slate-400">
                            Kosong
                          </span>
                        </div>
                      )}
                    </Td>
                    <Td>
                      {j.pemegang ? (
                        <div className="flex items-center gap-3">
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={sedangMengubah}
                            onClick={() => onAjukanPergantian(j)}
                          >
                            Ajukan Pergantian
                          </Button>
                          <button
                            type="button"
                            className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
                            title="Reset Password"
                            onClick={() => onResetPassword(j)}
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
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => onIsiJabatan(j)}
                        >
                          + Buat Akun
                        </Button>
                      )}
                    </Td>
                  </tr>
                ))}
                {/* Bukan bagian dari `daftar.map`: LPM tidak punya baris di
                    tabel `pengurus`, jadi bukan `Jabatan` — datanya lewat
                    prop terpisah (`lpmNama`/`onUbahLpm`), bukan array ini. */}
                <tr className="border-t-2 border-slate-200 bg-slate-50/40 transition-colors hover:bg-slate-50/80">
                  <Td className="font-semibold text-slate-900">Ketua LPM</Td>
                  <Td className="font-medium text-slate-800">
                    {lpmNama ? (
                      lpmNama
                    ) : (
                      <span className="font-normal text-slate-400">—</span>
                    )}
                  </Td>
                  <Td className="text-sm text-slate-400">—</Td>
                  <Td className="text-sm text-slate-400">—</Td>
                  <Td>
                    <Button size="sm" variant="secondary" onClick={onUbahLpm}>
                      Ubah Nama
                    </Button>
                  </Td>
                </tr>
              </tbody>
            </Table>
          )}
        </QueryBoundary>
      </CardContent>
    </Card>
  );
}
