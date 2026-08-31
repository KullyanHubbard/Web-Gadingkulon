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

/**
 * Sorotan brand untuk baris nav / pilihan aktif.
 *
 * `bg-brand-600/10`, bukan `bg-brand-50`: ramp brand sengaja tidak dibalik di
 * mode gelap (lihat CLAUDE.md), jadi brand-50 jadi tambalan hampir putih di
 * sana. Tint transparan menumpang latar apa pun yang ada di bawahnya, jadi satu
 * kelas cukup untuk dua mode; cuma warna teksnya yang perlu `dark:`.
 */
export const SOROT_BRAND = 'font-bold text-brand-600 dark:text-brand-300';
