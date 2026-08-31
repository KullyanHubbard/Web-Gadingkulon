import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { pesanError } from '@/lib/utils';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useJawabPengajuan, useMenungguJawaban } from '../hooks/use-pergantian';

/**
 * Kotak "Menunggu persetujuan Anda".
 *
 * Ditaruh di kerangka dashboard, bukan di satu halaman: ini panggilan yang
 * tidak boleh terlewat, dan pengurus tidak selalu mendarat di halaman yang
 * sama. Kosong = tidak menggambar apa pun.
 *
 * Isinya hanya pengajuan yang memang ditujukan kepada orang ini — bukan
 * disembunyikan di layar, backend memang tidak mengirimkan yang lain.
 */
export function PersetujuanPanel() {
  const { isPengurus } = useAuth();
  const { data } = useMenungguJawaban(isPengurus);
  const jawab = useJawabPengajuan();

  if (!isPengurus || !data || data.length === 0) return null;

  return (
    <Card className="mb-6 border-amber-300">
      <CardHeader
        title="Menunggu persetujuan Anda"
        description="Jawaban tidak bisa diubah setelah dikirim."
      />
      <CardContent className="space-y-4">
        {data.map((p) => (
          // `bg-amber-500/[9%]`, bukan `bg-amber-50`: ramp amber tidak dibalik di
          // mode gelap, jadi amber-50 tetap kuning muda sementara teks slate di
          // atasnya ikut terang — tulisannya hilang. Tint transparan menumpang
          // latar kartu, jadi satu kelas benar di dua mode; pola yang sama
          // dengan `SOROT_BRAND` di `lib/colors.ts`.
          <div
            key={p.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-amber-500/[9%] px-4 py-3"
          >
            <div className="text-sm">
              <p className="font-medium text-slate-900">
                Pergantian {p.jabatan}
              </p>
              <p className="text-slate-600">
                Diusulkan: {p.kandidatNama} · RT {p.kandidatRt}/RW{' '}
                {p.kandidatRw}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={jawab.isPending}
                onClick={() => {
                  if (!window.confirm(`Tolak pergantian ${p.jabatan}?`)) return;
                  jawab.mutate({ id: p.id, setuju: false });
                }}
              >
                Tolak
              </Button>
              <Button
                size="sm"
                disabled={jawab.isPending}
                onClick={() => {
                  if (
                    !window.confirm(
                      `Setujui ${p.kandidatNama} sebagai ${p.jabatan}?`,
                    )
                  )
                    return;
                  jawab.mutate({ id: p.id, setuju: true });
                }}
              >
                Setujui
              </Button>
            </div>
          </div>
        ))}
        {jawab.error && (
          <Alert tone="error">
            {pesanError(jawab.error, 'Gagal mengirim jawaban.')}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
