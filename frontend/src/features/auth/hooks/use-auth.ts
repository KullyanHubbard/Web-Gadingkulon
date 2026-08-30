import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { paths } from '@/routes/paths';
import { authApi } from '../api/auth-api';
import { useAuthStore } from '../auth-store';
import type { GantiPassword, PetugasCredentials, Role } from '../types';
import { ROLE_PENGURUS } from '../types';

/** Akses state auth (user, role, status). */
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return {
    user,
    isAuthenticated,
    /** Kelola akun — satu-satunya kewenangan Admin, dan ia buta data warga. */
    isAdmin: user?.role === 'ADMIN',
    /** Dukuh/RW/RT — boleh membaca data warga. */
    isPengurus: user ? ROLE_PENGURUS.includes(user.role) : false,
    /** Password awal dari Admin belum diganti: seluruh aplikasi masih terkunci. */
    harusGantiPassword: user?.harusGantiPassword ?? false,
  };
}

/** Login pengurus: username + password. Memastikan peran yang diisi cocok. */
export function useLoginPetugas() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: async ({
      credentials,
      expectedRole,
    }: {
      credentials: PetugasCredentials;
      expectedRole: Role;
    }) => {
      const session = await authApi.login(credentials);

      if (session.user.role !== expectedRole) {
        // Akun berhasil masuk, tapi perannya tidak sesuai yang dipilih di layar.
        // Cabut kembali sesi yang telanjur dibuat di backend.
        await authApi.logout(session.token).catch(() => undefined);
        const p = ROLE_PENGURUS.includes(expectedRole) ? expectedRole : 'Admin';
        throw new Error(`Username atau password salah untuk akun ${p}.`);
      }

      return session;
    },
    onSuccess: (session) => setSession(session),
  });
}

/** Ganti password sendiri. Sesi diperbarui di tempat supaya penanda
 *  `harusGantiPassword` langsung padam tanpa login ulang. */
export function useGantiPassword() {
  const updateUser = useAuthStore((s) => s.updateUser);
  return useMutation({
    mutationFn: (payload: GantiPassword) => authApi.gantiPassword(payload),
    onSuccess: (user) => updateUser(user),
  });
}

/** Aksi logout: beri tahu API, bersihkan sesi + cache, lalu ke halaman login. */
export function useLogout() {
  const clear = useAuthStore((s) => s.clear);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return () => {
    // Beri tahu API (fire-and-forget), lalu bersihkan sesi lokal.
    void authApi.logout().catch(() => undefined);
    clear();
    // Buang seluruh cache agar data user sebelumnya tidak bocor ke user berikut.
    queryClient.clear();
    // Kembali ke login tanpa membawa state `from` milik user sebelumnya.
    navigate(paths.login, { replace: true });
  };
}
