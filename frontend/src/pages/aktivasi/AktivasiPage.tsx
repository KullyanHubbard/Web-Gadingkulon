import { AktivasiFlow } from '@/features/auth/components/AktivasiFlow';

/**
 * Aktivasi akun warga (NIK + tanggal lahir, lalu buat PIN).
 * Alur dua langkahnya ada di `AktivasiFlow`.
 */
export default function AktivasiPage() {
  return <AktivasiFlow />;
}
