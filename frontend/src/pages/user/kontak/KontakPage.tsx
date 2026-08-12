import { PageHeader } from '@/components/layout/PageHeader';
import { KontakForm } from '@/features/auth/components/KontakForm';

/**
 * Kontak warga — sepenuhnya OPSIONAL.
 *
 * Nomor HP & email di sini adalah data yang dikumpulkan padukuhan, BUKAN kunci
 * masuk: mengosongkannya tidak menghalangi warga mengakses datanya sendiri.
 */
export default function KontakPage() {
  return (
    <div>
      <PageHeader
        title="Kontak Saya"
        description="Agar pengurus padukuhan bisa menghubungi Anda bila ada informasi penting."
      />
      <KontakForm />
    </div>
  );
}
