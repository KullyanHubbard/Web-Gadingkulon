import { differenceInYears, format, isValid, parseISO } from 'date-fns';
import { id as localeId } from 'date-fns/locale';

/**
 * Helper tanggal lintas fitur.
 *
 * `hitungUmur` dipakai fitur penduduk (tampilan) maupun infografis (agregat
 * kelompok umur), jadi tempatnya di `lib` — bukan milik salah satu fitur.
 */

/** Hitung umur (tahun penuh) dari tanggal lahir ISO. */
export function hitungUmur(tanggalLahirIso: string): number {
  return differenceInYears(new Date(), parseISO(tanggalLahirIso));
}

/** Format tanggal ISO menjadi "17 Mei 1985". */
export function formatTanggal(iso: string): string {
  return format(parseISO(iso), 'd MMMM yyyy', { locale: localeId });
}

/** Bentuk tanggal yang dikirim ke backend. */
const POLA_ISO = /^\d{4}-\d{2}-\d{2}$/;

/**
 * ["Januari", …, "Desember"] — dari `Intl`, bukan daftar tulis tangan.
 *
 * Dipakai kolom bulan pada form aktivasi. Nama bulan, bukan angka: itulah yang
 * membuat isian tanggal tidak bisa salah dibaca (lihat `AktivasiCekView`).
 */
export const NAMA_BULAN: string[] = (() => {
  const format = new Intl.DateTimeFormat('id-ID', { month: 'long' });
  return Array.from({ length: 12 }, (_, i) =>
    format.format(new Date(2000, i, 1)),
  );
})();

/**
 * Susun `yyyy-MM-dd` dari tiga isian terpisah, atau `null` kalau tanggalnya
 * tidak sah.
 *
 * Dua hal yang digugurkan di sini, dan dua-duanya mustahil jadi tanggal lahir:
 * tanggal yang tidak ada di kalender (31 Februari), dan tanggal yang melewati
 * hari ini. Satu fungsi dipakai dua tempat — validasi Zod dan penyusun payload
 * — supaya aturannya tidak pernah bisa berbeda di antara keduanya.
 */
export function keTanggalLahirIso(bagian: {
  tanggal: string;
  bulan: string;
  tahun: string;
}): string | null {
  const { tanggal, bulan, tahun } = bagian;
  const iso = `${tahun}-${bulan.padStart(2, '0')}-${tanggal.padStart(2, '0')}`;
  if (!POLA_ISO.test(iso)) return null;

  const nilai = parseISO(iso);
  if (!isValid(nilai) || nilai > new Date()) return null;
  return iso;
}
