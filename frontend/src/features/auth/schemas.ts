import { z } from 'zod';

export const petugasLoginSchema = z.object({
  username: z.string().min(1, 'Username wajib diisi'),
  password: z.string().min(1, 'Password wajib diisi'),
});
export type PetugasLoginFormValues = z.infer<typeof petugasLoginSchema>;
