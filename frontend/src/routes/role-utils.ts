import type { Role } from '@/features/auth/types';
import { paths } from './paths';

/**
 * Halaman default setelah login. ADMIN mendarat di dashboard; PENGURUS
 * langsung ke daftar penduduk — itu yang ia pakai sehari-hari.
 */
export function homePathForRole(role: Role | undefined): string {
  return role === 'ADMIN' ? paths.admin.root : paths.admin.penduduk;
}
