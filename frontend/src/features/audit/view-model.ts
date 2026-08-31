import type { CatatanAudit } from './types';

/**
 * Tanggal & jam pakai `Intl` langsung, bukan helper di `lib/`.
 *
 * Bukan penghindaran gaya: tanpa impor beralias `@/`, berkas ini bisa diuji
 * apa adanya dengan `node --experimental-strip-types` — dan pemecah teks
 * perubahan di bawah adalah bagian yang paling perlu diuji di seluruh fitur ini.
 */
const TANGGAL = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});
const JAM = new Intl.DateTimeFormat('id-ID', {
  hour: '2-digit',
  minute: '2-digit',
});

/** Aksi mentah -> kalimat yang bisa dibaca orang. */
const AKSI_LABEL: Record<string, string> = {
  'ubah-warga': 'Mengubah data',
  'tambah-warga': 'Menambah warga',
  'tambah-pengurus': 'Membuatkan akun',
  'reset-password': 'Mereset password',
  'ubah-lpm': 'Mengubah nama Ketua LPM',
};

/** Satu perubahan kolom, sudah dipecah supaya bisa ditata di layar. */
export interface PerubahanKolom {
  kolom: string;
  lama: string;
  baru: string;
}

export interface BarisRiwayat {
  id: number;
  waktu: string;
  jam: string;
  aktor: string;
  aksi: string;
  sasaran: string;
  perubahan: PerubahanKolom[];
  /** Keterangan bebas yang bukan pasangan lama->baru (mis. wilayah warga baru). */
  catatan: string;
}

/**
 * Pecah "nama: 'A' -> 'B'; alamat.jalan: 'C' -> 'D'" jadi baris-baris.
 *
 * Backend menyimpannya sebagai teks karena yang membacanya manusia yang
 * menelusuri sengketa data. Pemecahannya di sini supaya tampilannya bisa
 * menata kolom, dan gagal-pecah tetap ditampilkan apa adanya sebagai catatan —
 * lebih baik terbaca kasar daripada hilang.
 */
export function toBarisRiwayat(c: CatatanAudit): BarisRiwayat {
  const potongan = (c.perubahan ?? '')
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);

  const perubahan: PerubahanKolom[] = [];
  const catatan: string[] = [];
  for (const p of potongan) {
    const cocok = p.match(/^([\w.]+):\s*(.*?)\s*->\s*(.*)$/);
    if (cocok) {
      perubahan.push({
        kolom: cocok[1].replace('alamat.', 'alamat '),
        lama: cocok[2].replace(/^'|'$/g, ''),
        baru: cocok[3].replace(/^'|'$/g, ''),
      });
    } else {
      catatan.push(p);
    }
  }

  const waktu = new Date(c.waktu);
  return {
    id: c.id,
    waktu: TANGGAL.format(waktu),
    jam: JAM.format(waktu),
    aktor: c.aktor,
    aksi: AKSI_LABEL[c.aksi] ?? c.aksi,
    sasaran: c.sasaran,
    perubahan,
    catatan: catatan.join('; '),
  };
}
