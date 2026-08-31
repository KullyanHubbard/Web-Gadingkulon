import { z } from 'zod';

/**
 * Batas minimal 8 karakter harus sama dengan `Field(min_length=8)` di
 * `backend/app/schemas/pengurus.py` — kalau berbeda, form meloloskan sesuatu
 * yang backend tolak dengan pesan yang tidak bisa dibaca pengurus.
 */
const password = z.string().min(8, 'Minimal 8 karakter');

/**
 * Mengisi jabatan kosong. Jabatannya sudah ditentukan barisnya, dan orangnya
 * dipilih dari data warga (bukan diketik), jadi form ini cuma menanyakan
 * username dan password awal.
 */
export const isiJabatanSchema = z.object({
  username: z
    .string()
    .min(3, 'Minimal 3 karakter')
    .max(32, 'Maksimal 32 karakter'),
  password,
});
export type IsiJabatanFormValues = z.infer<typeof isiJabatanSchema>;

export const passwordBaruSchema = z.object({ password });
export type PasswordBaruFormValues = z.infer<typeof passwordBaruSchema>;

/**
 * Ganti nama Ketua LPM. Batas 100 karakter harus sama dengan
 * `Field(max_length=100)` di `backend/app/schemas/pengurus.py` (`LpmUbah`).
 * Boleh kosong: string kosong berarti jabatan ditandai "Belum diisi", bukan
 * error input.
 */
export const namaLpmSchema = z.object({
  nama: z.string().trim().max(100, 'Maksimal 100 karakter'),
});
export type NamaLpmFormValues = z.infer<typeof namaLpmSchema>;
