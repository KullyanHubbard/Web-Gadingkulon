import { formatTanggal, hitungUmur } from '@/lib/tanggal';
import type { KartuKeluarga, Penduduk } from '@/types/penduduk';
import {
  agamaLabel,
  jenisKelaminLabel,
  pendidikanLabel,
  statusHubunganLabel,
  statusPerkawinanLabel,
} from './labels';

/**
 * Terjemahan model domain -> bentuk siap tampil.
 *
 * Semua penerjemahan enum, perhitungan umur, dan perangkaian alamat berhenti
 * di file ini. Komponen tampilan cukup mencetak string yang sudah jadi, jadi
 * aturan seperti "laki-laki diberi warna brand" hanya ada di satu tempat.
 */

/** Satu baris pada tabel daftar penduduk / anggota keluarga. */
export interface PendudukRow {
  id: string;
  nik: string;
  nama: string;
  jenisKelamin: string;
  /** Nada Badge untuk kolom L/P. */
  jenisKelaminTone: 'brand' | 'amber';
  hubungan: string;
  umur: string;
  agama: string;
}

export function toPendudukRow(p: Penduduk): PendudukRow {
  return {
    id: p.id,
    nik: p.nik,
    nama: p.nama,
    jenisKelamin: jenisKelaminLabel[p.jenisKelamin],
    jenisKelaminTone: p.jenisKelamin === 'LAKI_LAKI' ? 'brand' : 'amber',
    hubungan: statusHubunganLabel[p.statusHubunganKeluarga],
    umur: `${hitungUmur(p.tanggalLahir)} th`,
    agama: agamaLabel[p.agama],
  };
}

/** Satu pasangan label–nilai pada kartu detail. */
export interface DetailField {
  label: string;
  value: string;
}

/** Kartu detail satu penduduk, sudah dalam bentuk teks. */
export interface PendudukDetailView {
  nama: string;
  nik: string;
  hubungan: string;
  fields: DetailField[];
  alamat: string;
}

export function toPendudukDetail(p: Penduduk): PendudukDetailView {
  const { alamat } = p;
  return {
    nama: p.nama,
    nik: p.nik,
    hubungan: statusHubunganLabel[p.statusHubunganKeluarga],
    fields: [
      { label: 'No. KK', value: p.noKK },
      { label: 'Jenis Kelamin', value: jenisKelaminLabel[p.jenisKelamin] },
      {
        label: 'Tempat, Tgl Lahir',
        value: `${p.tempatLahir}, ${formatTanggal(p.tanggalLahir)}`,
      },
      { label: 'Umur', value: `${hitungUmur(p.tanggalLahir)} tahun` },
      { label: 'Agama', value: agamaLabel[p.agama] },
      {
        label: 'Status Perkawinan',
        value: statusPerkawinanLabel[p.statusPerkawinan],
      },
      { label: 'Pendidikan', value: pendidikanLabel[p.pendidikan] },
      { label: 'Pekerjaan', value: p.pekerjaan },
      { label: 'Gol. Darah', value: p.golonganDarah },
      { label: 'Kewarganegaraan', value: p.kewarganegaraan },
    ],
    alamat:
      `${alamat.jalan}, RT ${alamat.rt}/RW ${alamat.rw}, Desa ${alamat.desa}, ` +
      `Kec. ${alamat.kecamatan}, ${alamat.kabupaten}, ${alamat.provinsi} ${alamat.kodePos}`,
  };
}

/** Ringkasan satu Kartu Keluarga beserta anggotanya. */
export interface KartuKeluargaView {
  judul: string;
  noKK: string;
  jumlahAnggota: string;
  anggota: PendudukRow[];
}

export function toKartuKeluargaView(kk: KartuKeluarga): KartuKeluargaView {
  return {
    judul: `Kartu Keluarga · ${kk.kepalaKeluarga}`,
    noKK: kk.noKK,
    jumlahAnggota: `${kk.anggota.length} anggota`,
    anggota: kk.anggota.map(toPendudukRow),
  };
}
