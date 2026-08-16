import type { ReactNode } from 'react';
import {
  Bar,
  BarChart,
  Cell,
  LabelList,
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
  CHART_KATEGORI_COLORS,
  CHART_LEGEND_TEXT_COLOR,
  CHART_SLICE_LABEL_COLOR,
  warnaOrdinal,
} from '@/lib/colors';
import type { Distribusi } from '@/types/statistik';

/**
 * Ukuran teks di dalam chart, dalam piksel.
 *
 * Mengikuti skala tipe aplikasi (lihat `tailwind.config.js`) — kalau tidak,
 * teks chart jadi satu-satunya yang tertinggal kecil. Recharts menerima angka,
 * bukan class Tailwind, jadi nilainya tinggal di sini — satu tempat, bukan
 * angka lepas yang diulang di tiap prop.
 */
const UKURAN_TEKS_CHART = 13;

/**
 * Ruang di kanan batang, dalam piksel, untuk angka yang dicetak di ujungnya.
 * Tanpa ini angka pada batang terpanjang tertimpa tepi kartu.
 *
 * ponytail: lebar tetap, muat sampai 5 digit pada `UKURAN_TEKS_CHART`. Cacah
 * warga sedesa tidak sedekat itu ke batasnya. Kalau komponen ini nanti dipakai
 * untuk angka yang lebih besar, hitung dari nilai terpanjang di `data`.
 */
const RUANG_ANGKA_KANAN = 44;

/**
 * Bar chart horizontal untuk distribusi kategori.
 *
 * Batangnya diwarnai ramp ORDINAL, bukan hue kategorik: yang masuk ke sini
 * kategori berurutan (kelompok umur, jenjang pendidikan) atau daftar terurut
 * menurun, dan enam hue berbeda di situ menyiratkan enam hal yang tak
 * berhubungan — padahal urutannya justru isinya.
 *
 * Cacahnya dicetak permanen di ujung batang, jadi chart ini tidak punya
 * tooltip: hover bukan syarat untuk membaca angkanya, dan menaruh tooltip di
 * atas angka yang sudah tercetak cuma mengulang isi yang sama. Aturan yang
 * sama dipakai donut berlabel di bawah.
 */
export function DistribusiBarChart({ data }: { data: Distribusi[] }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(200, data.length * 44)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ left: 8, right: RUANG_ANGKA_KANAN, top: 4, bottom: 4 }}
      >
        <XAxis type="number" allowDecimals={false} hide />
        <YAxis
          type="category"
          dataKey="label"
          width={104}
          tick={{ fontSize: UKURAN_TEKS_CHART, fill: CHART_AXIS_COLOR }}
          axisLine={false}
          tickLine={false}
        />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={22}>
          {data.map((_, i) => (
            <Cell key={i} fill={warnaOrdinal(i, data.length)} />
          ))}
          <LabelList
            dataKey="value"
            position="right"
            fontSize={UKURAN_TEKS_CHART}
            fill={CHART_AXIS_COLOR}
          />
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
 * Cacah untuk ditempel di teks legenda, mis. `' 120'`.
 *
 * Kosong bila Recharts tidak memberi angka — beda dengan `angka()` yang jatuh
 * ke `0`: nol di sini terbaca sebagai "tidak ada warga di kategori ini",
 * padahal yang terjadi bentuk payload-nya berubah. Legenda tanpa angka jelek,
 * legenda yang salah angka lebih buruk.
 */
function teksCacah(nilai: unknown): string {
  return typeof nilai === 'number' ? ` ${nilai}` : '';
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
 * Celah antar-irisan, dalam derajat.
 *
 * Spek desainnya "2px latar yang memisahkan", bukan baji lebar: pada radius
 * donut besar (±270px) sudut ini jatuh di sekitar 2px, dan menyusut proporsional
 * di chart kecil. Nilai lama (2°) menghasilkan celah ±10px — terbaca sebagai
 * potongan, bukan sebagai spasi.
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
    <div className="relative">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            // Recharts menjadikan grup donut tab stop (`rootTabIndex` bawaannya
            // 0). Chart ini tidak punya aksi keyboard apa pun, jadi itu cuma
            // perhentian kosong buat pengguna Tab — keluarkan dari urutan fokus.
            rootTabIndex={-1}
            // Cincin dilebarkan saat berlabel: di layar sempit, cincin tipis
            // tidak cukup menampung dua baris teks dan label mulai keluar ke
            // latar — teks putihnya jadi tak terbaca di sana.
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
          {/* Tooltip hanya untuk chart tanpa label langsung. Saat tiap irisan
              sudah mencantumkan nama & jumlahnya sendiri, tooltip cuma
              mengulang isi yang persis sama di atas gambar yang sudah bersih. */}
          {!labelIrisan && (
            <Tooltip
              contentStyle={{
                borderRadius: 8,
                fontSize: 12,
                border: 'none',
                boxShadow: '0 4px 12px rgb(15 23 42 / 0.12)',
              }}
            />
          )}
          {showLegend && (
            <Legend
              iconType="circle"
              wrapperStyle={{ fontSize: UKURAN_TEKS_CHART }}
              // Cacah ikut dicetak di legenda, bukan cuma di tooltip: irisan
              // kecil (Konghucu, Buddha) tidak muat teks di dalamnya, dan
              // legenda satu-satunya tempat SEMUA kategori pasti terbaca tanpa
              // hover. `entry.payload` = baris data aslinya, jadi `.value`
              // cacah yang sama dengan yang menggambar irisannya.
              formatter={(
                nama: string,
                entry: { payload?: { value?: unknown } },
              ) => (
                <span style={{ color: CHART_LEGEND_TEXT_COLOR }}>
                  {nama}
                  {teksCacah(entry.payload?.value)}
                </span>
              )}
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
  );
}
