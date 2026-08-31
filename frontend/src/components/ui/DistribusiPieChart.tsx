import type { ReactNode } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import type { PieLabelRenderProps } from 'recharts';
import { CHART_KATEGORI_COLORS, CHART_SLICE_LABEL_COLOR } from '@/lib/colors';
import { LegendaDonut } from './LegendaDonut';
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
              // Bawaan Recharts `stroke: '#fff'`. Di kartu putih tidak kelihatan,
              // di mode gelap jadi cincin terang yang membungkus tiap irisan.
              // Celah antar-irisan sudah dibawa `paddingAngle`, jadi tidak perlu
              // garis sama sekali.
              stroke="none"
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
                // Warna dibaca dari CSS variable yang dibalik `:root.dark`
                // (CLAUDE.md). Tanpa `background`, Recharts memakai bawaannya
                // yang putih — menyilaukan di atas kartu gelap.
                contentStyle={{
                  borderRadius: 8,
                  fontSize: UKURAN_TEKS_CHART,
                  background: 'rgb(var(--surface))',
                  border: '1px solid rgb(var(--slate-300))',
                  boxShadow: '0 4px 12px rgb(2 6 23 / 0.24)',
                }}
                // Bawaannya warna irisan itu sendiri; hue kategorik yang gelap
                // (mis. bata `#9f4d48`) nyaris hilang di atas latar gelap.
                itemStyle={{ color: 'rgb(var(--slate-700))' }}
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
