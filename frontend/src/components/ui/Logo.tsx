import logoUtama from '@/assets/Logo-utama.svg';
import { env } from '@/config/env';
import { cn } from '@/lib/utils';

interface LogoProps {
  /** Tinggi & efek warna dari pemakainya; lebarnya selalu ikut rasio. */
  className?: string;
}

/**
 * Lambang SIDUK — SATU-SATUNYA tempat berkasnya ditentukan. Dipakai di kepala
 * `Sidebar`, `PublicSidebar`, `PublicTopbar`, dan dua titik di `AuthLayout`.
 *
 * Berkasnya wordmark (tulisan "SIDUK", rasio ±4,9:1), bukan lambang persegi.
 * Karena itu tidak ada label teks `env.appName` lagi di sebelahnya — dulu ada,
 * dan menyandingkannya dengan wordmark cuma menghasilkan "SIDUK SIDUK". Nama
 * aplikasinya sekarang hidup di `alt`, jadi pembaca layar tetap mendengarnya.
 *
 * Lebarnya `w-auto`: kotak persegi (`w-6`) akan memampatkan tulisannya.
 * Pemakainya menyetel tinggi saja.
 *
 * Warnanya ikut berkas (`#3b1368`), bukan `currentColor` — kelas `text-*` tidak
 * berpengaruh sama sekali. Untuk latar gelap dipakai `brightness-0 invert`
 * (lihat panel brand `AuthLayout`): satu kelas memutihkan berkasnya, jadi tidak
 * perlu menyiapkan berkas kedua versi putih.
 */
export function Logo({ className }: LogoProps) {
  return (
    <img
      src={logoUtama}
      alt={env.appName}
      className={cn('h-7 w-auto dark:brightness-0 dark:invert', className)}
    />
  );
}
