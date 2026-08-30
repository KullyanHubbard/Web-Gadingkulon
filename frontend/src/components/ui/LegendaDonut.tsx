import type { Distribusi } from '@/types/statistik';

/**
 * Legenda donut — bukan `<Legend>` bawaan Recharts: legenda bawaan membungkus
 * itemnya jadi baris yang patah di tempat acak dan angkanya tidak pernah lurus.
 *
 * Cacah dicetak di sini, bukan cuma di tooltip — irisan kecil tidak muat teks,
 * jadi legenda satu-satunya tempat SEMUA kategori pasti terbaca tanpa hover.
 */
export function LegendaDonut({
  data,
  warna,
}: {
  data: Distribusi[];
  warna: readonly string[];
}) {
  const total = data.reduce((n, d) => n + d.value, 0);

  return (
    <ul className="mt-5 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
      {data.map((d, i) => (
        <li
          key={d.label}
          // Garis tipis antar-baris: legenda ini kolom angka, bukan kumpulan
          // chip. `nth-child(2)` ikut dibuka hanya di 2 kolom — di 1 kolom
          // baris kedua memang butuh garisnya.
          className="flex items-center gap-3 border-t border-slate-100 py-2 text-sm first:border-t-0 sm:[&:nth-child(2)]:border-t-0"
        >
          {/* Cincin, bukan bulatan penuh: kuncinya jadi donut mini — bentuk yang
              sama dengan irisan yang diwakilinya. */}
          <span
            className="h-3 w-3 shrink-0 rounded-full border-[3px]"
            style={{ borderColor: warna[i % warna.length] }}
            aria-hidden
          />
          {/* Teks label memakai netral, BUKAN warna serinya: seri terang cuma
              1,9-2,7:1 di atas kartu putih — tak terbaca sebagai huruf.
              Identitas seri dibawa cincin di sebelah kirinya. */}
          <span className="truncate text-slate-600">{d.label}</span>
          <span className="ml-auto min-w-[2.5rem] text-right font-semibold tabular-nums text-slate-900">
            {d.value}
          </span>
          <span className="w-9 text-right text-xs tabular-nums text-slate-400">
            {total === 0 ? '—' : `${Math.round((d.value / total) * 100)}%`}
          </span>
        </li>
      ))}
    </ul>
  );
}
