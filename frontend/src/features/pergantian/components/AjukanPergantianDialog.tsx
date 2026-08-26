import { useState } from 'react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useDebounce } from '@/hooks/use-debounce';
import { cn } from '@/lib/utils';
import { pesanError } from '@/lib/utils';
import {
  useAjukanPergantian,
  useCariKandidat,
} from '../hooks/use-pergantian';
import type { Kandidat } from '../types';

interface AjukanPergantianDialogProps {
  /** Kursi yang diganti penghuninya; `null` = dialog tertutup. */
  kursi: { kursi: string; jabatan: string; namaPenghuni: string } | null;
  onClose: () => void;
}

/**
 * Usulkan pengganti untuk satu kursi terisi.
 *
 * Tiap pilihan menampilkan "Nama — RT/RW": di satu padukuhan nama kembar itu
 * biasa, dan salah pilih di sini berarti mengusulkan orang yang salah untuk
 * sebuah jabatan.
 */
export function AjukanPergantianDialog({
  kursi,
  onClose,
}: AjukanPergantianDialogProps) {
  const [cari, setCari] = useState('');
  const [terpilih, setTerpilih] = useState<Kandidat | null>(null);
  const debounced = useDebounce(cari);
  const { data: kandidat, isFetching } = useCariKandidat(debounced);
  const ajukan = useAjukanPergantian();

  function tutup() {
    setCari('');
    setTerpilih(null);
    ajukan.reset();
    onClose();
  }

  function kirim() {
    if (!kursi || !terpilih) return;
    ajukan.mutate(
      { kursi: kursi.kursi, kandidatId: terpilih.id },
      { onSuccess: tutup },
    );
  }

  return (
    <Modal
      open={Boolean(kursi)}
      onClose={tutup}
      title={`Ajukan Pergantian — ${kursi?.jabatan ?? ''}`}
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Penghuni sekarang: <strong>{kursi?.namaPenghuni}</strong>. Pergantian
          baru berlaku setelah disetujui perangkat desa yang berwenang — Anda
          mengajukan, mereka yang memutuskan.
        </p>

        <Input
          label="Cari warga pengganti"
          placeholder="Ketik nama, minimal 2 huruf…"
          value={cari}
          onChange={(e) => {
            setCari(e.target.value);
            setTerpilih(null);
          }}
        />

        {debounced.trim().length >= 2 && (
          <div className="max-h-56 overflow-y-auto rounded-lg border-1 border-slate-200">
            {isFetching && (
              <p className="px-3 py-2 text-sm text-slate-500">Mencari…</p>
            )}
            {!isFetching && kandidat?.length === 0 && (
              <p className="px-3 py-2 text-sm text-slate-500">
                Tidak ada warga bernama itu.
              </p>
            )}
            {kandidat?.map((k) => (
              <button
                key={k.id}
                type="button"
                onClick={() => setTerpilih(k)}
                className={cn(
                  'flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-slate-50',
                  terpilih?.id === k.id && 'bg-brand-50 font-medium',
                )}
              >
                <span>{k.nama}</span>
                <span className="text-xs text-slate-500">
                  RT {k.rt}/RW {k.rw}
                </span>
              </button>
            ))}
          </div>
        )}

        {ajukan.error && (
          <Alert tone="error">
            {pesanError(ajukan.error, 'Gagal mengajukan pergantian.')}
          </Alert>
        )}

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={tutup}>
            Batal
          </Button>
          <Button
            type="button"
            disabled={!terpilih}
            isLoading={ajukan.isPending}
            onClick={kirim}
          >
            Ajukan{terpilih ? ` ${terpilih.nama}` : ''}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
