import { z } from 'zod';

/**
 * Batas minimal 8 karakter harus sama dengan `Field(min_length=8)` di
 * `backend/app/schemas/pengurus.py` — kalau berbeda, form meloloskan sesuatu
 * yang backend tolak dengan pesan yang tidak bisa dibaca pengurus.
 */
const password = z.string().min(8, 'Minimal 8 karakter');

export const pengurusBaruSchema = z
  .object({
    username: z
      .string()
      .min(3, 'Minimal 3 karakter')
      .max(32, 'Maksimal 32 karakter'),
    password,
    nama: z.string().min(1, 'Nama wajib diisi'),
    role: z.enum(['ADMIN', 'PENGURUS']),
    rw: z.string().trim(),
    rt: z.string().trim(),
  })
  .refine((v) => !(v.rt && !v.rw), {
    path: ['rw'],
    message: 'Ketua RT harus disertai RW-nya.',
  });
export type PengurusBaruFormValues = z.infer<typeof pengurusBaruSchema>;

export const passwordBaruSchema = z.object({ password });
export type PasswordBaruFormValues = z.infer<typeof passwordBaruSchema>;
