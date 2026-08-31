import { cn } from '@/lib/utils';
import type { WargaPilihan } from '@/lib/warga-api';
import { Input } from './Input';

interface PilihWargaProps {
  label: string;
  cari: string;
  onCariChange: (nilai: string) => void;
  hasil: WargaPilihan[] | undefined;
  sedangMencari: boolean;
  terpilih: WargaPilihan | null;
  onPilih: (warga: WargaPilihan) => void;
  hint?: string;
}

/**
 * Kotak cari + daftar warga yang bisa diklik.
 *
 * Tiap baris menampilkan "Nama — RT/RW": di satu padukuhan nama kembar itu
 * biasa, dan salah pilih berarti menunjuk orang yang salah untuk sebuah
 * jabatan.
 *
 * Tampilan saja — pemanggil yang memegang state & querynya.
 */
export function PilihWarga({
  label,
  cari,
  onCariChange,
  hasil,
  sedangMencari,
  terpilih,
  onPilih,
  hint,
}: PilihWargaProps) {
  const cukupPanjang = cari.trim().length >= 2;

  return (
    <div className="space-y-2">
      <Input
        label={label}
        placeholder="Ketik nama…"
        hint={hint}
        value={cari}
        onChange={(e) => onCariChange(e.target.value)}
      />

      {terpilih && (
        <p className="text-sm text-slate-700">
          Terpilih: <strong>{terpilih.nama}</strong>{' '}
          <span className="text-xs text-slate-500">
            (RT {terpilih.rt}/RW {terpilih.rw})
          </span>
        </p>
      )}

      {cukupPanjang && (
        <div className="max-h-56 overflow-y-auto rounded-lg border-1 border-slate-200">
          {sedangMencari && (
            <p className="px-3 py-2 text-sm text-slate-500">Mencari…</p>
          )}
          {!sedangMencari && hasil?.length === 0 && (
            <p className="px-3 py-2 text-sm text-slate-500">
              Tidak ada warga bernama itu.
            </p>
          )}
          {hasil?.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => onPilih(w)}
              className={cn(
                'flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-white/10',
                terpilih?.id === w.id && 'font-bold text-brand-600 dark:text-brand-300',
              )}
            >
              <span>{w.nama}</span>
              <span className="text-xs text-slate-500">
                RT {w.rt}/RW {w.rw}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
