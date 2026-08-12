import { LoginWargaForm } from '@/features/auth/components/LoginWargaForm';

/**
 * Halaman masuk utama — form warga (NIK + PIN).
 * Tidak ada pemilih peran: pengurus punya halaman terpisah, dan peran dibaca
 * dari akun. Layar ini dioptimalkan untuk 350 KK warga, bukan belasan pengurus.
 */
export default function LoginPage() {
  return <LoginWargaForm />;
}
