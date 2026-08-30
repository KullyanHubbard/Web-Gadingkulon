import { z } from 'zod';

/**
 * Form berita.
 *
 * `tanggalTerbit` di sini BOLEH `<input type="date">`, berbeda dari tanggal
 * lahir warga (CLAUDE.md §6): yang mengisinya pengurus di depan komputer balai
 * desa, bukan warga yang mengetik lepas, dan salah baca dd/mm langsung
 * kelihatan di daftar berita yang ada di layar yang sama.
 */
export const beritaSchema = z.object({
  judul: z.string().trim().min(4, 'Judul minimal 4 huruf'),
  penulis: z.string().trim().min(2, 'Nama penulis wajib diisi'),
  tanggalTerbit: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Pilih tanggal terbit'),
  isi: z.string().trim().min(20, 'Isi berita minimal 20 huruf'),
  /** Data URL foto utama; kosong berarti berita tanpa foto. */
  foto: z.string(),
});

export type BeritaFormValues = z.infer<typeof beritaSchema>;
