import { formatTanggal, hitungUmur } from '@/lib/tanggal';
import type { Penduduk } from './types';
import {
  agamaLabel,
  golonganDarahLabel,
  statusKependudukanLabel,
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
  nama: string;
  jenisKelamin: string;
  /** Nada Badge untuk kolom L/P. */
  jenisKelaminTone: 'brand' | 'amber';
  hubungan: string;
  umur: string;
  agama: string;
  /**
   * Diisi hanya untuk warga yang sudah pindah atau meninggal.
   *
   * Mereka masih tampil di daftar supaya penandaan yang keliru bisa
   * dibatalkan, tapi TIDAK ikut dihitung di statistik — tanpa penanda ini, dua
   * baris yang kelihatan sama menghasilkan angka yang berbeda dan tidak ada
   * yang tahu kenapa.
   */
  statusTidakAktif: string | null;
}

export function toPendudukRow(p: Penduduk): PendudukRow {
  return {
    id: p.id,
    nama: p.nama,
    jenisKelamin: jenisKelaminLabel[p.jenisKelamin],
    jenisKelaminTone: p.jenisKelamin === 'LAKI_LAKI' ? 'brand' : 'amber',
    hubungan: statusHubunganLabel[p.statusHubunganKeluarga],
    umur: `${hitungUmur(p.tanggalLahir)} th`,
    agama: agamaLabel[p.agama],
    statusTidakAktif:
      p.statusKependudukan === 'AKTIF'
        ? null
        : statusKependudukanLabel[p.statusKependudukan],
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
  hubungan: string;
  fields: DetailField[];
  alamat: string;
}

export function toPendudukDetail(p: Penduduk): PendudukDetailView {
  const { alamat } = p;
  return {
    nama: p.nama,
    hubungan: statusHubunganLabel[p.statusHubunganKeluarga],
    fields: [
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
      { label: 'Gol. Darah', value: golonganDarahLabel[p.golonganDarah] },
      { label: 'Kewarganegaraan', value: p.kewarganegaraan },
    ],
    alamat:
      `${alamat.jalan}, RT ${alamat.rt}/RW ${alamat.rw}, Desa ${alamat.desa}, ` +
      `Kec. ${alamat.kecamatan}, ${alamat.kabupaten}, ${alamat.provinsi} ${alamat.kodePos}`,
  };
}
