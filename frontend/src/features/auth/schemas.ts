import { z } from 'zod';

/** NIK: tepat 16 digit angka. */
const nik = z
  .string()
  .min(1, 'NIK wajib diisi')
  .regex(/^\d{16}$/, 'NIK harus 16 digit angka');

/** PIN: tepat 6 digit angka — cukup pendek untuk diingat lansia. */
const pin = z
  .string()
  .min(1, 'PIN wajib diisi')
  .regex(/^\d{6}$/, 'PIN harus 6 digit angka');

export const wargaLoginSchema = z.object({ nik, pin });
export type WargaLoginFormValues = z.infer<typeof wargaLoginSchema>;

export const petugasLoginSchema = z.object({
  username: z.string().min(1, 'Username wajib diisi'),
  password: z.string().min(1, 'Password wajib diisi'),
});
export type PetugasLoginFormValues = z.infer<typeof petugasLoginSchema>;

export const aktivasiSchema = z.object({
  nik,
  tanggalLahir: z.string().min(1, 'Tanggal lahir wajib diisi'),
});
export type AktivasiFormValues = z.infer<typeof aktivasiSchema>;

export const setPinSchema = z
  .object({
    pin,
    ulangiPin: z.string().min(1, 'Ulangi PIN wajib diisi'),
  })
  .refine((v) => v.pin === v.ulangiPin, {
    message: 'PIN tidak sama dengan sebelumnya',
    path: ['ulangiPin'],
  });
export type SetPinFormValues = z.infer<typeof setPinSchema>;

/** Nomor HP Indonesia: 08xx, 628xx, atau +628xx. */
const NO_HP_PATTERN = /^(\+62|62|0)8[1-9]\d{6,11}$/;

/**
 * Kontak sepenuhnya opsional — string kosong sah, karena warga boleh melewati
 * form ini tanpa kehilangan akses apa pun.
 */
export const kontakSchema = z.object({
  noHp: z
    .string()
    .trim()
    .refine(
      (v) => v === '' || NO_HP_PATTERN.test(v),
      'Nomor HP tidak valid (contoh: 081234567890)',
    ),
  email: z
    .string()
    .trim()
    .refine(
      (v) => v === '' || z.string().email().safeParse(v).success,
      'Email tidak valid (contoh: nama@gmail.com)',
    ),
});
export type KontakFormValues = z.infer<typeof kontakSchema>;
