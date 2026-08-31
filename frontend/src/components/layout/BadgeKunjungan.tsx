import { Users } from 'lucide-react';
import { useKunjunganHariIni } from '@/features/kunjungan/hooks/use-kunjungan';
import { formatAngka } from '@/lib/utils';

/**
 * Badge mengambang kiri-bawah: kunjungan hari ini.
 *
 * Disembunyikan selagi angkanya belum datang (`undefined`) — badge yang
 * sempat menampilkan 0 lalu melompat ke angka sebenarnya lebih mengganggu
 * daripada muncul belakangan.
 */
export function BadgeKunjungan() {
  const jumlah = useKunjunganHariIni();
  if (jumlah === undefined) return null;

  return (
    <div
      className="flex items-center gap-2 rounded-full border border-slate-200 bg-surface py-2 pl-3 pr-4 text-sm shadow-lg"
      aria-label={`${formatAngka(jumlah)} kunjungan hari ini`}
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600/10 text-brand-700 dark:text-brand-300">
        <Users className="h-4 w-4" />
      </span>
      {/* Label disembunyikan di layar sempit: bertiga dengan tombol Pengaduan
          dan Aksesibilitas, teks penuh memaksa badge pecah tiga baris di ponsel
          390px. Ikon + `aria-label` menahan artinya. */}
      <span className="whitespace-nowrap">
        <span className="font-bold text-slate-900">{formatAngka(jumlah)}</span>
        <span className="ml-1 hidden text-slate-500 sm:inline">
          Kunjungan Hari Ini
        </span>
      </span>
    </div>
  );
}
