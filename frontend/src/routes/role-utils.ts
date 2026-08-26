import type { Role } from '@/features/auth/types';
import { paths } from './paths';

/**
 * Halaman default setelah login.
 *
 * Admin mendarat di kelola akun — satu-satunya halaman yang terbuka untuknya,
 * karena seluruh data warga memang ditutup dari Admin. Dukuh/RW/RT mendarat di
 * daftar penduduk, yang mereka pakai sehari-hari.
 */
export function homePathForRole(role: Role | undefined): string {
  return role === 'ADMIN' ? paths.admin.pengurus : paths.admin.penduduk;
}
