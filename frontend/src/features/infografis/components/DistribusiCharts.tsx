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
import {
  CHART_AXIS_COLOR,
  CHART_CURSOR_COLOR,
  CHART_SERIES_COLORS,
} from '@/lib/colors';
import type { Distribusi } from '../types';

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
            <Cell
              key={i}
              fill={CHART_SERIES_COLORS[i % CHART_SERIES_COLORS.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/** Pie/donut chart untuk komposisi kategori. */
export function DistribusiPieChart({ data }: { data: Distribusi[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="label"
          innerRadius={55}
          outerRadius={90}
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell
              key={i}
              fill={CHART_SERIES_COLORS[i % CHART_SERIES_COLORS.length]}
            />
          ))}
        </Pie>
        <Tooltip contentStyle={{ borderRadius: 8, fontSize: 12 }} />
        <Legend
          iconType="circle"
          wrapperStyle={{ fontSize: 12 }}
          formatter={(value: string) => value}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
