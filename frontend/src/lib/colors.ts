/**
 * Warna chart per kategori.
 *
 * ponytail: dipakai berputar (`i % length`) di kartu distribusi — kategori
 * ke-9 bakal kembaran warna kategori pertama (mis. RW yang jumlahnya lebih
 * dari 8). Tambah entri di sini kalau ada kartu yang kepotong.
 */
export const CHART_KATEGORI_COLORS = [
  '#5a78bc', // indigo
  '#9f4d48', // bata
  '#579f68', // hijau
  '#ae74b1', // plum
  '#94771a', // kunyit
  '#007a87', // toska
  '#c2703d', // jingga
  '#b23a63', // magenta
] as const;

/**
 * Versi lembut sebuah warna palet, dicampur ke putih oleh CSS. Pakai
 * `color-mix`, bukan hex tint sendiri: hex kembaran harus diingat orang untuk
 * ikut diperbarui, dan itu persis cara palet mulai melenceng.
 *
 * Kadarnya rendah (14%) karena yang ditumpangi teks & ikon.
 *
 * ponytail: `color-mix` butuh Chrome 111 / Safari 16.2. Di Android lama
 * latarnya jadi putih polos — teks tetap terbaca, jadi dibiarkan. Ganti dengan
 * tint hex kalau ternyata banyak pembaca di sana.
 */
export function warnaLembut(warna: string, persen = 14): string {
  return `color-mix(in srgb, ${warna} ${persen}%, white)`;
}

export const CHART_SLICE_LABEL_COLOR = '#ffffff';
