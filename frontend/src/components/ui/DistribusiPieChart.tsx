import type { ReactNode } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { PieLabelRenderProps } from 'recharts';
import { CHART_KATEGORI_COLORS, CHART_SLICE_LABEL_COLOR } from '@/lib/colors';
import type { Distribusi } from '@/types/statistik';

/**
 * Sepadan `text-xs` pada skala tipe aplikasi yang sengaja dinaikkan. Ditulis
 * sebagai angka karena Recharts tidak menerima class Tailwind.
 */
const UKURAN_TEKS_CHART = 13;

interface DistribusiPieChartProps {
  data: Distribusi[];
  /** Tinggi area chart dalam piksel. */
  height?: number;
  /** Matikan legenda bila pemanggil menyusun legendanya sendiri. */
  showLegend?: boolean;
  /** Isi lubang donut, mis. angka total. Dipusatkan ke area donut saja. */
  center?: ReactNode;
  /**
   * Baris teks yang dicetak di atas irisan ke-`index` (maksimal dua baris).
   * Kosongkan bila irisan tidak perlu berlabel.
   *
   * Teksnya dibuat pemanggil supaya komponen ini tidak ikut memformat angka;
   * warnanya selalu putih (`CHART_SLICE_LABEL_COLOR`).
   */
  labelIrisan?: (index: number) => string[];
  /**
   * Warna irisan; default hue kategorik. Urutannya = urutan data.
   *
   * Oper ramp sendiri hanya kalau kategorinya memang berurutan — donut agama
   * & status perkawinan tidak, jadi keduanya memakai default.
   */
  warna?: readonly string[];
}

/** Ambil nilai numerik dari properti Recharts yang bertipe longgar. */
function angka(nilai: unknown): number {
  return typeof nilai === 'number' ? nilai : 0;
}

/**
 * Bukan `<Legend>` bawaan Recharts: legenda bawaan membungkus itemnya jadi
 * baris yang patah di tempat acak dan angkanya tidak pernah lurus.
 *
 * Cacah dicetak di sini, bukan cuma di tooltip — irisan kecil tidak muat teks,
 * jadi legenda satu-satunya tempat SEMUA kategori pasti terbaca tanpa hover.
 */
function LegendaDonut({
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

const DERAJAT = Math.PI / 180;

/** Cetak label di tengah tebal cincin, mengikuti sudut tengah irisannya. */
function labelDiIrisan(
  props: PieLabelRenderProps,
  baris: (index: number) => string[],
) {
  const index = angka(props.index);
  const teks = baris(index);
  if (teks.length === 0) return null;

  const cx = angka(props.cx);
  const cy = angka(props.cy);
  const jariJari = (angka(props.innerRadius) + angka(props.outerRadius)) / 2;
  const sudut = -angka(props.midAngle) * DERAJAT;
  const x = cx + jariJari * Math.cos(sudut);
  const y = cy + jariJari * Math.sin(sudut);

  return (
    <text
      x={x}
      y={y}
      className="font-sans"
      fill={CHART_SLICE_LABEL_COLOR}
      textAnchor="middle"
      dominantBaseline="central"
    >
      {teks.map((isi, i) => (
        <tspan
          key={isi}
          x={x}
          dy={i === 0 ? -5 : 20}
          fontSize={i === 0 ? 15 : 14}
          fontWeight={i === 0 ? 700 : 600}
          opacity={1}
        >
          {isi}
        </tspan>
      ))}
    </text>
  );
}

/**
 * Celah antar-irisan (derajat). Disetel agar jatuh ~2px pada radius donut besar
 * (±270px). Jangan naikkan ke 2° — itu menghasilkan celah ±10px yang terbaca
 * sebagai potongan, bukan spasi.
 */
const CELAH_DERAJAT = 0.6;

/** Pie/donut chart untuk komposisi kategori. */
export function DistribusiPieChart({
  data,
  height = 260,
  showLegend = true,
  center,
  labelIrisan,
  warna = CHART_KATEGORI_COLORS,
}: DistribusiPieChartProps) {
  return (
    <>
      {/* `relative` dibatasi ke area donut saja: kalau legenda ikut di dalam
          kotak yang sama, titik tengah `center` bergeser turun. */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              dataKey="value"
              nameKey="label"
              // Bawaan Recharts 0, menjadikan donut tab stop kosong — chart ini
              // tidak punya aksi keyboard apa pun.
              rootTabIndex={-1}
              // Cincin dilebarkan saat berlabel: cincin tipis tidak muat dua baris
              // teks, dan label yang keluar ke latar jadi putih di atas putih.
              innerRadius={labelIrisan ? '52%' : '58%'}
              outerRadius={labelIrisan ? '88%' : '88%'}
              paddingAngle={CELAH_DERAJAT}
              strokeWidth={1}
              labelLine={false}
              label={
                labelIrisan
                  ? (props: PieLabelRenderProps) =>
                      labelDiIrisan(props, labelIrisan)
                  : undefined
              }
            >
              {data.map((_, i) => (
                <Cell key={i} fill={warna[i % warna.length]} />
              ))}
            </Pie>
            {/* Hanya untuk chart tanpa label langsung — kalau irisannya sudah
              mencantumkan nama & jumlah, tooltip cuma mengulanginya. */}
            {!labelIrisan && (
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  fontSize: UKURAN_TEKS_CHART,
                  border: 'none',
                  boxShadow: '0 4px 12px rgb(15 23 42 / 0.12)',
                }}
              />
            )}
          </PieChart>
        </ResponsiveContainer>

        {center && (
          <div
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
            aria-hidden
          >
            {center}
          </div>
        )}
      </div>

      {showLegend && <LegendaDonut data={data} warna={warna} />}
    </>
  );
}
