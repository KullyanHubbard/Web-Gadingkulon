import { differenceInYears, format, parseISO } from 'date-fns';
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
