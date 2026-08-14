import { useAuth } from '@/features/auth/hooks/use-auth';
import { AdminDashboard } from '@/features/infografis/components/AdminDashboard';

/**
 * Dashboard pengurus.
 *
 * Halaman ini hanya merakit: sesi dibaca dari fitur `auth`, lalu namanya
 * dioper ke dashboard milik fitur `infografis` — dua fitur bertemu di sini,
 * bukan saling mengimpor.
 */
export default function AdminDashboardPage() {
  const { user } = useAuth();

  return <AdminDashboard namaPengurus={user?.nama ?? ''} />;
}
