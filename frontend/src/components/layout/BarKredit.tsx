import { KreditKkn } from '@/components/ui/KreditKkn';
import { AksesibilitasWidget } from './AksesibilitasWidget';
import { BadgeKunjungan } from './BadgeKunjungan';
import { TombolPengaduan } from './TombolPengaduan';
import { TombolTema } from './TombolTema';

/**
 * Bar kredit berisi: penghitung kunjungan di kiri, tombol pengaduan / ukuran
 * teks / tema di kanan. Dipakai SEMUA kerangka berbar — publik maupun di balik
 * login — supaya kakinya persis sama di mana pun; dulu bloknya disalin per
 * kerangka dan halaman masuk serta dashboard kehabisan seluruh isinya.
 *
 * Ada di sini, bukan di dalam `KreditKkn`, karena `components/ui` tidak boleh
 * mengimpor `features/*` (§4) dan `BadgeKunjungan` membaca `features/kunjungan`.
 */
export function BarKredit({ className }: { className?: string }) {
  return (
    <KreditKkn
      className={className}
      kiri={<BadgeKunjungan />}
      kanan={
        <div className="flex items-center gap-3">
          <TombolPengaduan />
          <AksesibilitasWidget />
          <TombolTema />
        </div>
      }
    />
  );
}
