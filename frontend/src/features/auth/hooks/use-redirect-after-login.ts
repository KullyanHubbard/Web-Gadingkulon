import { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { paths } from '@/routes/paths';
import { homePathForRole } from '@/routes/role-utils';
import type { Role, Session } from '../types';

/** Lokasi asal yang dititipkan `RequireAuth` sebelum melempar ke login. */
interface LokasiAsal {
  pathname?: string;
  search?: string;
  hash?: string;
}

/**
 * Satu-satunya halaman yang dibatasi role. Seluruh `/admin/*` lain terbuka
 * untuk semua pengurus — baca tidak dibatasi peran maupun wilayah.
 */
const areaKhususAdmin = paths.admin.pengurus;

function bolehDibukaOleh(role: Role | undefined, pathname: string): boolean {
  return pathname === areaKhususAdmin ? role === 'ADMIN' : true;
}

/**
 * Arahkan pengguna setelah berhasil masuk.
 *
 * Dua hal yang dijaga di sini:
 *
 * 1. `from` diperiksa terhadap role. Pengurus yang tautannya menuju halaman
 *    kelola akun dulu dilempar ke sana lalu langsung ditendang balik oleh
 *    `RequireRole`; sekarang ia mendarat di halaman awalnya sendiri.
 * 2. `search` & `hash` ikut dibawa, bukan cuma `pathname`.
 */
export function useRedirectAfterLogin(): (session: Session) => void {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(
    (session: Session) => {
      const asal = (location.state as { from?: LokasiAsal } | null)?.from;
      const beranda = homePathForRole(session.user.role);

      const tujuan =
        asal?.pathname && bolehDibukaOleh(session.user.role, asal.pathname)
          ? `${asal.pathname}${asal.search ?? ''}${asal.hash ?? ''}`
          : beranda;

      navigate(tujuan, { replace: true });
    },
    [navigate, location.state],
  );
}
