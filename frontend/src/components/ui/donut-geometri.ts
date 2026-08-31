/**
 * Geometri donut: pembagian sudut + jalur SVG satu irisan.
 *
 * Dipisah dari komponennya karena ini satu-satunya bagian yang bisa salah diam-
 * diam — dan begitu dipisah, ia bisa diperiksa tanpa browser:
 * `node --experimental-strip-types src/components/ui/donut-geometri.check.ts`
 *
 * Konvensi sudutnya diwarisi dari Recharts yang dulu menggambar donut ini: 0°
 * di jam 3, membesar BERLAWANAN arah jarum jam. Dipertahankan supaya urutan
 * warna irisan tidak berputar dibanding tampilan sebelumnya.
 */

const DERAJAT = Math.PI / 180;

export interface Irisan {
  /** Indeks di data asal — penentu warna & teks labelnya. */
  index: number;
  /** Derajat, berlawanan arah jarum jam dari jam 3. */
  mulai: number;
  akhir: number;
  tengah: number;
}

/**
 * Bagi lingkaran menurut `nilai`. Nilai nol/negatif dilewati — irisan tanpa
 * luas tetap menghasilkan jalur SVG yang digambar sebagai garis rambut.
 *
 * Total nol mengembalikan daftar kosong: tidak ada yang bisa dibagi, dan
 * membagi nol menghasilkan NaN yang lolos sampai atribut `d`.
 */
export function irisanDonut(nilai: number[]): Irisan[] {
  const total = nilai.reduce((n, v) => n + Math.max(v, 0), 0);
  if (total <= 0) return [];

  const hasil: Irisan[] = [];
  let kursor = 0;
  nilai.forEach((v, index) => {
    if (v <= 0) return;
    const akhir = kursor + (v / total) * 360;
    hasil.push({ index, mulai: kursor, akhir, tengah: (kursor + akhir) / 2 });
    kursor = akhir;
  });
  return hasil;
}

/** Titik pada lingkaran. Sumbu-y layar ke bawah, jadi sin-nya dibalik tanda. */
export function titik(
  cx: number,
  cy: number,
  r: number,
  sudut: number,
): [number, number] {
  return [cx + r * Math.cos(sudut * DERAJAT), cy - r * Math.sin(sudut * DERAJAT)];
}

/**
 * Jalur satu irisan cincin: busur luar berlawanan arah jarum jam, lalu busur
 * dalam kembali.
 *
 * `sweep-flag` 0 di busur luar dan 1 di busur dalam — di koordinat layar
 * (y ke bawah) 0 itulah yang berlawanan arah jarum jam. Tertukar berarti
 * irisannya digambar sebagai sisa lingkaran.
 */
export function jalurIrisan(
  cx: number,
  cy: number,
  rDalam: number,
  rLuar: number,
  mulai: number,
  akhir: number,
): string {
  const besar = akhir - mulai > 180 ? 1 : 0;
  const [xL0, yL0] = titik(cx, cy, rLuar, mulai);
  const [xL1, yL1] = titik(cx, cy, rLuar, akhir);
  const [xD1, yD1] = titik(cx, cy, rDalam, akhir);
  const [xD0, yD0] = titik(cx, cy, rDalam, mulai);

  return [
    `M${xL0} ${yL0}`,
    `A${rLuar} ${rLuar} 0 ${besar} 0 ${xL1} ${yL1}`,
    `L${xD1} ${yD1}`,
    `A${rDalam} ${rDalam} 0 ${besar} 1 ${xD0} ${yD0}`,
    'Z',
  ].join('');
}
