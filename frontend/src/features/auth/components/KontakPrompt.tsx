import { useAuth } from '../hooks/use-auth';
import { KontakPromptView } from './KontakPromptView';

/**
 * Ajakan sekali jalan untuk melengkapi kontak.
 *
 * Kontak murni opsional, jadi ajakan ini hanya muncul selama nomor HP dan
 * email masih sama-sama kosong, dan tidak pernah menghalangi isi halaman.
 */
export function KontakPrompt() {
  const { user, isUser } = useAuth();

  if (!isUser || user?.noHp || user?.email) return null;
  return <KontakPromptView />;
}
