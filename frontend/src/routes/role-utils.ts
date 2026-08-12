import type { Role } from '@/features/auth/types';
import { paths } from './paths';

/** Halaman default (beranda) sesuai role setelah login. */
export function homePathForRole(role: Role | undefined): string {
  return role === 'ADMIN' ? paths.admin.root : paths.beranda;
}
