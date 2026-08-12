import type { ReactNode } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { PieLabelRenderProps } from 'recharts';
import {
  CHART_AXIS_COLOR,
  CHART_CURSOR_COLOR,
  warnaSeri,
  warnaTeksSeri,
} from '@/lib/colors';
import type { Distribusi } from '@/types/statistik';

/** Bar chart horizontal untuk distribusi kategori. */
export function DistribusiBarChart({ data }: { data: Distribusi[] }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 44)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ left: 8, right: 16, top: 4, bottom: 4 }}
      >
        <XAxis type="number" allowDecimals={false} hide />
        <YAxis
          type="category"
          dataKey="label"
          width={90}
          tick={{ fontSize: 12, fill: CHART_AXIS_COLOR }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: CHART_CURSOR_COLOR }}
          contentStyle={{ borderRadius: 8, fontSize: 12 }}
        />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={22}>
          {data.map((_, i) => (
            <Cell key={i} fill={warnaSeri(i)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

interface DistribusiPieChartProps {
  data: Distribusi[];
  /** Tinggi area chart dalam piksel. */
  height?: number;
  /** Matikan legenda bawaan bila pemanggil menyusun legendanya sendiri. */
  showLegend?: boolean;
  /**
   * Isi lubang donut, mis. angka total. Dipasang di tengah wadah, jadi pakai
   * bersama `showLegend={false}` — legenda bawaan menggeser donut ke atas.
   */
  center?: ReactNode;
  /**
   * Baris teks yang dicetak di atas irisan ke-`index` (maksimal dua baris).
   * Kosongkan bila irisan tidak perlu berlabel.
   *
   * Teksnya dibuat pemanggil supaya komponen ini tidak ikut memformat angka;
   * warnanya diambil dari `warnaTeksSeri` agar kontras di atas warna irisannya.
   */
  labelIrisan?: (index: number) => string[];
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
      fill={warnaTeksSeri(index)}
      textAnchor="middle"
      dominantBaseline="central"
    >
      {teks.map((isi, i) => (
        <tspan
          key={isi}
          x={x}
          dy={i === 0 ? -4 : 18}
          fontSize={i === 0 ? 14 : 12}
          fontWeight={i === 0 ? 600 : 400}
        >
          {isi}
        </tspan>
      ))}
    </text>
  );
}

/** Pie/donut chart untuk komposisi kategori. */
export function DistribusiPieChart({
  data,
  height = 260,
  showLegend = true,
  center,
  labelIrisan,
}: DistribusiPieChartProps) {
  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            // Cincin dilebarkan saat berlabel: di layar sempit, cincin 30%
            // tidak cukup menampung dua baris teks dan label mulai keluar ke
            // latar — teks putihnya jadi tak terbaca di sana.
            innerRadius={labelIrisan ? '46%' : '58%'}
            outerRadius={labelIrisan ? '92%' : '88%'}
            paddingAngle={2}
            labelLine={false}
            label={
              labelIrisan
                ? (props: PieLabelRenderProps) =>
                    labelDiIrisan(props, labelIrisan)
                : undefined
            }
          >
            {data.map((_, i) => (
              <Cell key={i} fill={warnaSeri(i)} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
          {showLegend && (
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
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
  );
}
