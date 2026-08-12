import {
  LayoutDashboard,
  Users,
  PieChart,
  IdCard,
  Phone,
  type LucideIcon,
} from 'lucide-react';
import type { Role } from '@/features/auth/types';
import { paths } from '@/routes/paths';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  /** Cocokkan sebagai prefix (untuk highlight nested route). */
  end?: boolean;
}

/** Menu navigasi sesuai role. */
export function navItemsForRole(role: Role | undefined): NavItem[] {
  if (role === 'ADMIN') {
    return [
      {
        label: 'Dashboard',
        to: paths.admin.root,
        icon: LayoutDashboard,
        end: true,
      },
      { label: 'Data Penduduk', to: paths.admin.penduduk, icon: Users },
      { label: 'Infografis', to: paths.admin.infografis, icon: PieChart },
      { label: 'Data Saya', to: paths.beranda, icon: IdCard },
    ];
  }
  // Warga. "Kontak Saya" hanya relevan untuk warga — pengurus tidak punya
  // akun warga sehingga halaman itu tidak berlaku bagi mereka.
  return [
    { label: 'Data Saya', to: paths.beranda, icon: IdCard },
    { label: 'Kontak Saya', to: paths.kontak, icon: Phone },
  ];
}
