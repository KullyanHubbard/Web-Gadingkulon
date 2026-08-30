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

export const CHART_SLICE_LABEL_COLOR = '#ffffff';
