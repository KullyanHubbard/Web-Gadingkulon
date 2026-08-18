import {
  agamaLabel,
  pendidikanLabel,
  relabel,
  statusPerkawinanLabel,
} from '@/features/penduduk/labels';
import type { RincianRw } from '@/features/statistik-publik/types';
import { toStatWarga } from '@/lib/stat-warga';
import type { StatWarga } from '@/lib/stat-warga';
import type { PanelDistribusi } from '@/types/statistik';

/**
 * Susunan panel rincian satu RW di halaman depan.
 *
 * Tinggal di level halaman, bukan di dalam fitur, karena di sinilah dua fitur
 * bertemu: angka agregat dari `statistik-publik`, peta label domain dari
 * `penduduk`. Fitur tidak boleh saling mengimpor (CLAUDE.md §4) — halaman boleh
 * merakit. Alasan & bentuknya sama persis dengan
 * `pages/admin/infografis/view-model.ts`.
 */

export interface RincianRwViewModel {
  stat: StatWarga[];
  panels: PanelDistribusi[];
}

export function toRincianRw(rw: RincianRw): RincianRwViewModel {
  return {
    stat: toStatWarga(rw),
    panels: [
      {
        id: 'umur',
        judul: 'Kelompok Umur',
        jenis: 'bar',
        data: rw.perKelompokUmur,
      },
      {
        id: 'pendidikan',
        judul: 'Tingkat Pendidikan',
        jenis: 'bar',
        data: relabel(rw.perPendidikan, pendidikanLabel),
      },
      {
        id: 'agama',
        judul: 'Komposisi Agama',
        jenis: 'bar',
        data: relabel(rw.perAgama, agamaLabel),
      },
      {
        id: 'perkawinan',
        judul: 'Status Perkawinan',
        jenis: 'bar',
        data: relabel(rw.perStatusPerkawinan, statusPerkawinanLabel),
      },
    ],
  };
}
