import { create } from 'zustand';
import type { AuthUser, Session } from './types';
import { clearSession, getStoredSession, storeSession } from './token-storage';

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  /** Simpan sesi (dipanggil setelah login sukses) + persist ke storage. */
  setSession: (session: Session) => void;
  /** Perbarui data user tanpa login ulang (mis. setelah ganti password). */
  updateUser: (user: AuthUser) => void;
  /** Bersihkan sesi (logout). */
  clear: () => void;
}

const initial = getStoredSession();

export const useAuthStore = create<AuthState>((set) => ({
  user: initial?.user ?? null,
  token: initial?.token ?? null,
  isAuthenticated: Boolean(initial?.token),

  setSession: (session) => {
    storeSession(session);
    set({
      user: session.user,
      token: session.token,
      isAuthenticated: true,
    });
  },

  updateUser: (user) =>
    set((state) => {
      if (!state.token) return state;
      storeSession({ token: state.token, user });
      return { user };
    }),

  clear: () => {
    clearSession();
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
