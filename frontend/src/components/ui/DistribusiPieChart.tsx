import { useEffect, useState, type ReactNode } from 'react';
import { CHART_KATEGORI_COLORS, CHART_SLICE_LABEL_COLOR } from '@/lib/colors';
import { irisanDonut, jalurIrisan, titik } from './donut-geometri';
import { LegendaDonut } from './LegendaDonut';
import type { Distribusi } from '@/types/statistik';

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

/**
 * Celah antar-irisan (derajat). Disetel agar jatuh ~2px pada radius donut besar
 * (±270px). Jangan naikkan ke 2° — itu menghasilkan celah ±10px yang terbaca
 * sebagai potongan, bukan spasi.
 */
const CELAH_DERAJAT = 0.6;

/**
 * Radius cincin sebagai pecahan setengah sisi kotak. Angkanya warisan dari
 * Recharts supaya donut ini setebal yang sebelumnya.
 *
 * Cincin dilebarkan saat berlabel: cincin tipis tidak muat dua baris teks, dan
 * label yang keluar ke latar jadi putih di atas putih.
 */
const RADIUS_LUAR = 0.88;
const RADIUS_DALAM_BERLABEL = 0.52;
const RADIUS_DALAM = 0.58;

/** Cetak label di tengah tebal cincin, mengikuti sudut tengah irisannya. */
function LabelIrisan({
  pusat,
  radius,
  sudut,
  teks,
}: {
  pusat: number;
  radius: number;
  sudut: number;
  teks: string[];
}) {
  const [x, y] = titik(pusat, pusat, radius, sudut);

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
        >
          {isi}
        </tspan>
      ))}
    </text>
  );
}

/**
 * Pie/donut chart untuk komposisi kategori.
 *
 * SVG buatan sendiri, BUKAN Recharts — jangan dikembalikan ke library. Donut
 * ini satu-satunya pemakai Recharts di seluruh aplikasi, dan pustakanya
 * berbobot 372 KB (103 KB terkompresi) yang harus tuntas diunduh & diurai
 * sebelum /statistik tampil; di `npm run dev` versi belum diminifikasinya ~2,2
 * MB. Bar chart di sebelahnya sudah lama HTML+CSS dengan alasan yang sama —
 * lihat `DistribusiBarChart`. Geometrinya di `donut-geometri.ts`, lengkap
 * dengan self-check.
 */
export function DistribusiPieChart({
  data,
  height = 260,
  showLegend = true,
  center,
  labelIrisan,
  warna = CHART_KATEGORI_COLORS,
}: DistribusiPieChartProps) {
  // `matchMedia`, BUKAN listener `resize`: di ponsel `resize` menembak tiap
  // kali bar URL muncul/hilang saat halaman digulir, dan tiap panel di layar
  // punya listener sendiri — satu gulir jadi puluhan render ulang.
  // Query media hanya menembak saat batasnya benar-benar dilewati.
  const [sempit, setSempit] = useState(
    () => window.matchMedia('(max-width: 639px)').matches,
  );

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const ikuti = (e: MediaQueryListEvent) => setSempit(e.matches);
    setSempit(mq.matches);
    mq.addEventListener('change', ikuti);
    return () => mq.removeEventListener('change', ikuti);
  }, []);

  const sisi = sempit ? Math.min(height, 320) : height;
  const pusat = sisi / 2;
  const rLuar = pusat * RADIUS_LUAR;
  const rDalam =
    pusat * (labelIrisan ? RADIUS_DALAM_BERLABEL : RADIUS_DALAM);
  const rLabel = (rDalam + rLuar) / 2;

  const irisan = irisanDonut(data.map((d) => d.value));
  // Satu kategori = lingkaran penuh, dan busur yang mulai persis di titik
  // akhirnya sendiri tidak menggambar apa pun. Digambar sebagai cincin.
  const penuh = irisan.length === 1;

  return (
    <>
      {/* `relative` dibatasi ke area donut saja: kalau legenda ikut di dalam
          kotak yang sama, titik tengah `center` bergeser turun. */}
      <div className="relative">
        {/* Sisi viewBox = tinggi dalam piksel, jadi 1 satuan = 1 piksel selama
            kotaknya lebih lebar daripada tinggi — ukuran teks label boleh
            ditulis apa adanya. Di kotak yang lebih sempit semuanya mengecil
            sebanding, sama seperti sebelumnya.

            `aria-hidden`: tiap angkanya sudah tersedia sebagai teks di legenda
            atau daftar di sebelahnya, jadi pembaca layar tidak perlu menyusuri
            path satu per satu. */}
        <svg
          viewBox={`0 0 ${sisi} ${sisi}`}
          width="100%"
          height={sisi}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          {penuh ? (
            <circle
              cx={pusat}
              cy={pusat}
              r={rLabel}
              fill="none"
              stroke={warna[irisan[0].index % warna.length]}
              strokeWidth={rLuar - rDalam}
            />
          ) : (
            irisan.map((s) => {
              // Celah dipangkas dari kedua ujung. Dibatasi seperempat lebar
              // irisan supaya irisan tipis tidak habis dimakan celahnya.
              const celah = Math.min(
                CELAH_DERAJAT / 2,
                (s.akhir - s.mulai) / 4,
              );
              return (
                <path
                  key={s.index}
                  d={jalurIrisan(
                    pusat,
                    pusat,
                    rDalam,
                    rLuar,
                    s.mulai + celah,
                    s.akhir - celah,
                  )}
                  fill={warna[s.index % warna.length]}
                >
                  {/* Hanya untuk chart tanpa label langsung — kalau irisannya
                      sudah mencantumkan nama & jumlah, ini cuma mengulanginya.
                      `<title>` bawaan browser, bukan tooltip bergaya: seluruh
                      angkanya toh sudah tercetak di legenda di bawah. */}
                  {!labelIrisan && (
                    <title>{`${data[s.index].label}: ${data[s.index].value}`}</title>
                  )}
                </path>
              );
            })
          )}

          {labelIrisan &&
            irisan.map((s) => {
              const teks = labelIrisan(s.index);
              if (teks.length === 0) return null;
              return (
                <LabelIrisan
                  key={s.index}
                  pusat={pusat}
                  radius={rLabel}
                  sudut={s.tengah}
                  teks={teks}
                />
              );
            })}
        </svg>

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
