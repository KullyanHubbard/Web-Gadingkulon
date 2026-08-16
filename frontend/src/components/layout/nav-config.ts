import ikonChartBar from '@/assets/icons/nav/chart-bar.svg';
import ikonChartPie from '@/assets/icons/nav/chart-pie.svg';
import ikonId from '@/assets/icons/nav/id.svg';
import ikonPhone from '@/assets/icons/nav/phone.svg';
import ikonUsers from '@/assets/icons/nav/users.svg';
import type { Role } from '@/features/auth/types';
import { CHART_KATEGORI_COLORS } from '@/lib/colors';
import { paths } from '@/routes/paths';

export interface NavItem {
  label: string;
  to: string;
  /** URL berkas SVG di `@/assets/icons/nav`. Kosong = menu tampil tanpa ikon. */
  icon?: string;
  /**
   * Warna penanda halaman: mewarnai ikonnya, dan jadi latar lembut saat menu
   * itu aktif. Satu halaman = satu warna tetap di semua role — menu yang muncul
   * di dua role tidak boleh berganti warna tergantung siapa yang masuk.
   */
  aksen: string;
  /** Cocokkan sebagai prefix (untuk highlight nested route). */
  end?: boolean;
}

/**
 * Statistik desa (landing publik). `end: true` wajib — tanpa itu `/` cocok
 * sebagai prefix setiap route dan menunya menyala terus.
 */
const statistikDesa: NavItem = {
  label: 'Statistik Desa',
  to: paths.landing,
  icon: ikonChartBar,
  aksen: CHART_KATEGORI_COLORS[3],
  end: true,
};

/** Muncul di dua role, jadi warnanya ditulis sekali di sini. */
const dataSaya: NavItem = {
  label: 'Data Saya',
  to: paths.beranda,
  icon: ikonId,
  aksen: CHART_KATEGORI_COLORS[2],
};

/** Menu navigasi sesuai role. */
export function navItemsForRole(role: Role | undefined): NavItem[] {
  if (role === 'ADMIN') {
    return [
      {
        label: 'Dashboard',
        to: paths.admin.root,
        aksen: CHART_KATEGORI_COLORS[0],
        end: true,
      },
      {
        label: 'Data Penduduk',
        to: paths.admin.penduduk,
        icon: ikonUsers,
        aksen: CHART_KATEGORI_COLORS[5],
      },
      {
        label: 'Infografis',
        to: paths.admin.infografis,
        icon: ikonChartPie,
        aksen: CHART_KATEGORI_COLORS[4],
      },
      dataSaya,
      statistikDesa,
    ];
  }
  // Warga. "Kontak Saya" hanya relevan untuk warga — pengurus tidak punya
  // akun warga sehingga halaman itu tidak berlaku bagi mereka.
  return [
    dataSaya,
    {
      label: 'Kontak Saya',
      to: paths.kontak,
      icon: ikonPhone,
      aksen: CHART_KATEGORI_COLORS[1],
    },
    statistikDesa,
  ];
}
