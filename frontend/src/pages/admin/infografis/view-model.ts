import {
  agamaLabel,
  pendidikanLabel,
  relabel,
  statusPerkawinanLabel,
} from '@/features/penduduk/labels';
import type { InfografisData } from '@/features/infografis/types';
import type { PanelDistribusi } from '@/types/statistik';

/**
 * Susunan panel halaman infografis.
 *
 * Tinggal di level halaman, bukan di dalam fitur, karena di sinilah dua fitur
 * bertemu: angka agregat dari `infografis`, peta label domain dari `penduduk`.
 * Fitur tidak boleh saling mengimpor (CLAUDE.md §4) — halaman boleh merakit.
 */

export function toPanelInfografis(data: InfografisData): PanelDistribusi[] {
  return [
    {
      id: 'agama',
      judul: 'Komposisi Agama',
      deskripsi: 'Jumlah penduduk per agama',
      jenis: 'pie',
      data: relabel(data.perAgama, agamaLabel),
    },
    {
      id: 'umur',
      judul: 'Kelompok Umur',
      deskripsi: 'Sebaran penduduk berdasarkan usia',
      jenis: 'bar',
      data: data.perKelompokUmur,
    },
    {
      id: 'pendidikan',
      judul: 'Tingkat Pendidikan',
      deskripsi: 'Pendidikan terakhir penduduk',
      jenis: 'bar',
      data: relabel(data.perPendidikan, pendidikanLabel),
    },
    {
      id: 'perkawinan',
      judul: 'Status Perkawinan',
      deskripsi: 'Komposisi status perkawinan',
      jenis: 'pie',
      data: relabel(data.perStatusPerkawinan, statusPerkawinanLabel),
    },
    {
      id: 'dusun',
      judul: 'Sebaran per RW',
      deskripsi: 'Jumlah penduduk per Rukun Warga',
      jenis: 'bar',
      data: data.perDusun,
      lebarPenuh: true,
    },
  ];
}
