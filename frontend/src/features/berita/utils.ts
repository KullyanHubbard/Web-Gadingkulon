import type { Berita } from './types';

/**
 * Judul -> slug URL. Huruf kecil, hanya a-z/0-9, spasi jadi tanda hubung.
 *
 * Tanpa normalisasi diakritik: judul berita padukuhan berbahasa Indonesia,
 * yang tidak punya huruf beraksen. Karakter di luar pola dibuang, bukan
 * ditranslasi.
 */
export function keSlug(judul: string): string {
  return judul
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Slug yang belum dipakai berita lain. Bentrok diberi akhiran angka, bukan
 * ditolak: dua kegiatan tahunan bernama sama itu wajar ("Kerja Bakti Bulanan"),
 * dan menolaknya memaksa penulis mengarang judul yang tidak dia inginkan.
 */
export function slugUnik(
  judul: string,
  lain: Berita[],
  kecualiId?: string,
): string {
  const dasar = keSlug(judul) || 'berita';
  const terpakai = new Set(
    lain.filter((b) => b.id !== kecualiId).map((b) => b.slug),
  );
  if (!terpakai.has(dasar)) return dasar;

  let n = 2;
  while (terpakai.has(`${dasar}-${n}`)) n += 1;
  return `${dasar}-${n}`;
}

/** Terbaru dulu. Tanggal sama diurutkan menurut `id`, agar hasilnya stabil. */
export function urutTerbaru(daftar: Berita[]): Berita[] {
  return [...daftar].sort(
    (a, b) =>
      b.tanggalTerbit.localeCompare(a.tanggalTerbit) ||
      b.id.localeCompare(a.id),
  );
}

/** Paragraf isi artikel: dipisah baris kosong, yang kosong dibuang. */
export function keParagraf(isi: string): string[] {
  return isi
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

const formatterTanggal = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/** `'2026-08-31'` -> `'31 Agustus 2026'`. ISO tak sah dikembalikan apa adanya. */
export function formatTanggal(iso: string): string {
  const tanggal = new Date(`${iso}T00:00:00`);
  return Number.isNaN(tanggal.getTime())
    ? iso
    : formatterTanggal.format(tanggal);
}
