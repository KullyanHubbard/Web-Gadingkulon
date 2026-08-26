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

/**
 * ["Januari", …, "Desember"] — dari `Intl`, bukan daftar tulis tangan.
 *
 * Nama bulan, bukan angka. Itulah yang membuat isian tanggal tidak bisa salah
 * dibaca: "03" bisa berarti Maret atau tanggal 3 tergantung kotak mana yang
 * dilihat orang, "Maret" tidak bisa.
 */
export const NAMA_BULAN: string[] = (() => {
  const format = new Intl.DateTimeFormat('id-ID', { month: 'long' });
  return Array.from({ length: 12 }, (_, i) =>
    format.format(new Date(2000, i, 1)),
  );
})();

/** Tiga kotak isian tanggal lahir. `bulan` dua digit, "01"–"12". */
export interface TanggalTerpisah {
  tanggal: string;
  bulan: string;
  tahun: string;
}

/**
 * Satukan tiga kotak jadi ISO, atau `null` kalau tanggalnya tidak ada di
 * kalender (31 Februari) atau melewati hari ini.
 *
 * Tiga kotak, bukan `<input type="date">`: urutan kotak bawaan browser (dd/mm
 * vs mm/dd) ikut bahasa browser dan TIDAK bisa dipaksa — tidak lewat atribut,
 * CSS, maupun `lang`. Akibatnya isian diam-diam terbaca jadi tanggal lain, dan
 * tidak ada yang menyadarinya sampai datanya dipakai.
 */
export function keTanggalLahirIso(v: TanggalTerpisah): string | null {
  const t = Number(v.tanggal);
  const b = Number(v.bulan);
  const th = Number(v.tahun);
  if (!t || !b || !th) return null;
  const d = new Date(th, b - 1, t);
  // Rollover diam-diam: new Date(2026, 1, 31) jadi 3 Maret. Dibandingkan balik
  // supaya tanggal yang tidak ada di kalender tertangkap, bukan digeser.
  if (d.getFullYear() !== th || d.getMonth() !== b - 1 || d.getDate() !== t) {
    return null;
  }
  if (d > new Date()) return null;
  return `${th}-${String(b).padStart(2, '0')}-${String(t).padStart(2, '0')}`;
}

/** Pecah ISO jadi tiga kotak, untuk mengisi form saat mengubah data. */
export function dariTanggalLahirIso(iso: string): TanggalTerpisah {
  const [tahun = '', bulan = '', tanggal = ''] = iso.split('-');
  return { tanggal: String(Number(tanggal) || ''), bulan, tahun };
}
