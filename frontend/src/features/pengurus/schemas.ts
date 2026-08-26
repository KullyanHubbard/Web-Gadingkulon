import { z } from 'zod';

/**
 * Batas minimal 8 karakter harus sama dengan `Field(min_length=8)` di
 * `backend/app/schemas/pengurus.py` — kalau berbeda, form meloloskan sesuatu
 * yang backend tolak dengan pesan yang tidak bisa dibaca pengurus.
 */
const password = z.string().min(8, 'Minimal 8 karakter');

/** Mengisi kursi kosong. Kursinya sudah ditentukan barisnya, jadi form ini
 *  cuma menanyakan siapa orangnya dan password awalnya. */
export const isiKursiSchema = z.object({
  nama: z.string().min(1, 'Nama wajib diisi'),
  username: z
    .string()
    .min(3, 'Minimal 3 karakter')
    .max(32, 'Maksimal 32 karakter'),
  password,
});
export type IsiKursiFormValues = z.infer<typeof isiKursiSchema>;

export const passwordBaruSchema = z.object({ password });
export type PasswordBaruFormValues = z.infer<typeof passwordBaruSchema>;
