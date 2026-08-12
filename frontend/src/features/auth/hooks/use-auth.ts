import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { paths } from '@/routes/paths';
import { authApi } from '../api/auth-api';
import { useAuthStore } from '../auth-store';
import type {
  AktivasiCek,
  KontakPayload,
  PetugasCredentials,
  SetPinPayload,
  WargaCredentials,
} from '../types';

/** Akses state auth (user, role, status). */
export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return {
    user,
    isAuthenticated,
    isAdmin: user?.role === 'ADMIN',
    isUser: user?.role === 'USER',
  };
}

/** Login warga: NIK + PIN. */
export function useLoginWarga() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (credentials: WargaCredentials) =>
      authApi.loginWarga(credentials),
    onSuccess: (session) => setSession(session),
  });
}

/** Login pengurus: username + password. */
export function useLoginPetugas() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (credentials: PetugasCredentials) =>
      authApi.loginPetugas(credentials),
    onSuccess: (session) => setSession(session),
  });
}

/** Aktivasi langkah 1: verifikasi NIK + tanggal lahir, dapat tiket + nama. */
export function useCekAktivasi() {
  return useMutation({
    mutationFn: (payload: AktivasiCek) => authApi.cekAktivasi(payload),
  });
}

/** Aktivasi langkah 2: tukar tiket dengan PIN baru — langsung masuk. */
export function useSetPin() {
  const setSession = useAuthStore((s) => s.setSession);
  return useMutation({
    mutationFn: (payload: SetPinPayload) => authApi.setPin(payload),
    onSuccess: (session) => setSession(session),
  });
}

/** Simpan kontak opsional warga, lalu segarkan sesi tanpa login ulang. */
export function useSimpanKontak() {
  const updateUser = useAuthStore((s) => s.updateUser);
  return useMutation({
    mutationFn: (payload: KontakPayload) => authApi.simpanKontak(payload),
    onSuccess: (user) => updateUser(user),
  });
}

/** Reset PIN warga (admin). Setelah ini warga wajib aktivasi ulang. */
export function useResetPinWarga() {
  return useMutation({
    mutationFn: (nik: string) => authApi.resetPinWarga(nik),
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
