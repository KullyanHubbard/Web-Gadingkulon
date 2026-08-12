import { PageHeader } from '@/components/layout/PageHeader';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { KontakPrompt } from '@/features/auth/components/KontakPrompt';
import { DataWarga } from '@/features/penduduk/components/DataWarga';

/**
 * Beranda warga: menampilkan HANYA data milik NIK yang login,
 * plus anggota Kartu Keluarganya.
 *
 * Halaman ini hanya merakit — sesi dibaca fitur auth, datanya diambil fitur
 * penduduk lewat NIK yang dioper ke bawah.
 */
export default function BerandaPage() {
  const { user } = useAuth();

  return (
    <div>
      <PageHeader
        title={`Halo, ${user?.nama ?? 'Warga'} 👋`}
        description="Berikut data kependudukan Anda dan anggota keluarga."
      />

      <KontakPrompt />
      <DataWarga nik={user?.nik ?? ''} />
    </div>
  );
}
