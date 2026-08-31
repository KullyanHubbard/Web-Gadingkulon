import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { FileClock } from 'lucide-react';
import { QueryBoundary } from '@/components/ui/QueryBoundary';
import type { Pengajuan, StatusPengajuan } from '../types';

const warnaStatus: Record<StatusPengajuan, string> = {
  MENUNGGU: 'bg-amber-400',
  DISETUJUI: 'bg-green-400',
  DITOLAK: 'bg-red-400',
  GUGUR: 'bg-slate-300',
};

const labelStatus: Record<StatusPengajuan, string> = {
  MENUNGGU: 'Menunggu',
  DISETUJUI: 'Disetujui',
  DITOLAK: 'Ditolak',
  GUGUR: 'Gugur',
};

interface DaftarPengajuanViewProps {
  isLoading: boolean;
  isError: boolean;
  pengajuan: Pengajuan[] | undefined;
}

/** Riwayat pengajuan pergantian beserta siapa sudah menjawab apa. */
export function DaftarPengajuanView({
  isLoading,
  isError,
  pengajuan,
}: DaftarPengajuanViewProps) {
  return (
    <Card>
      <CardHeader title="Pengajuan Pergantian" />
      <CardContent className="p-0">
        <QueryBoundary
          isLoading={isLoading}
          isError={isError}
          data={pengajuan}
          isEmpty={(d) => d.length === 0}
          errorMessage="Gagal memuat daftar pengajuan."
          empty={
            <EmptyState
              icon={FileClock}
              title="Belum ada pengajuan"
            />
          }
        >
          {(daftar) => (
            <ul className="divide-y divide-slate-100">
              {daftar.map((p) => (
                <li key={p.id} className="px-5 py-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-slate-900">{p.jabatan}</p>
                      <p className="text-sm text-slate-600">
                        Diusulkan: {p.kandidatNama} · RT {p.kandidatRt}/RW{' '}
                        {p.kandidatRw}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2 w-2 rounded-full ${warnaStatus[p.status]}`}
                      />
                      <span className="text-sm font-medium text-slate-700">
                        {labelStatus[p.status]}
                      </span>
                    </div>
                  </div>

                  {p.suara.length > 0 && (
                    <ul className="mt-2 space-y-0.5 text-sm text-slate-600">
                      {p.suara.map((s) => (
                        <li key={s.pengurusId}>
                          {s.setuju ? '✓' : '✕'} {s.jabatan} ({s.nama}){' '}
                          {s.setuju ? 'menyetujui' : 'menolak'}
                        </li>
                      ))}
                    </ul>
                  )}

                  {p.sebab && (
                    <p className="mt-2 text-xs text-slate-500">{p.sebab}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </QueryBoundary>
      </CardContent>
    </Card>
  );
}
