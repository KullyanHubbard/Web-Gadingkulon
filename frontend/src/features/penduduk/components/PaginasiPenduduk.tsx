import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

/** Keterangan paginasi yang sudah dihitung container. */
export interface PaginasiView {
  /** mis. "1–8 dari 42" */
  ringkasan: string;
  halaman: number;
  totalHalaman: number;
  bisaMundur: boolean;
  bisaMaju: boolean;
  /** Query lama masih tampil sementara yang baru dimuat. */
  sedangMenyegarkan: boolean;
}

interface PaginasiPendudukProps {
  paginasi: PaginasiView;
  onPrev: () => void;
  onNext: () => void;
}

/** Baris navigasi halaman di kaki tabel penduduk. */
export function PaginasiPenduduk({
  paginasi,
  onPrev,
  onNext,
}: PaginasiPendudukProps) {
  return (
    <div className="flex items-center justify-between px-5 py-3 text-sm text-slate-500">
      <span>
        {paginasi.ringkasan}
        {paginasi.sedangMenyegarkan && ' · memperbarui…'}
      </span>
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="outline"
          disabled={!paginasi.bisaMundur}
          onClick={onPrev}
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="px-2">
          {paginasi.halaman} / {paginasi.totalHalaman}
        </span>
        <Button
          size="sm"
          variant="outline"
          disabled={!paginasi.bisaMaju}
          onClick={onNext}
          aria-label="Halaman berikutnya"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
