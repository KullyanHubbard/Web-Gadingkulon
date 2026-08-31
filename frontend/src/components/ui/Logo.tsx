import logoGelap from '@/assets/Logo-darkmode.png';
import logoTerang from '@/assets/Logo-lightmode.png';
import { env } from '@/config/env';
import { useTemaGelap } from '@/hooks/use-tema-gelap';
import { cn } from '@/lib/utils';

interface LogoProps {
  /** Tinggi dari pemakainya; lebarnya selalu ikut rasio berkas. */
  className?: string;
}

/**
 * Lambang SIDUK — SATU-SATUNYA tempat berkasnya ditentukan. Dipakai di kepala
 * `Sidebar`, `PublicSidebar`, `PublicNavbar`, `PublicTopbar`, dan `AuthLayout`.
 *
 * Berkasnya wordmark (tulisan "SIDUK", rasio ±6,2:1), bukan lambang persegi.
 * Karena itu tidak ada label teks `env.appName` lagi di sebelahnya — dulu ada,
 * dan menyandingkannya dengan wordmark cuma menghasilkan "SIDUK SIDUK". Nama
 * aplikasinya sekarang hidup di `alt`, jadi pembaca layar tetap mendengarnya.
 *
 * Lebarnya `w-auto`: kotak persegi (`w-6`) akan memampatkan tulisannya.
 * Pemakainya menyetel tinggi saja.
 *
 * **Dua berkas, satu yang diunduh.** Versinya ditukar lewat `src`, bukan dua
 * `<img>` yang saling disembunyikan `dark:hidden` — peramban tetap mengunduh
 * gambar yang `display:none`, jadi cara itu memuat dua-duanya di tiap muat
 * halaman. Berkas pasangannya baru diambil kalau temanya benar-benar diganti,
 * lalu masuk cache.
 *
 * Ini juga menggantikan `dark:brightness-0 dark:invert` yang dulu memutihkan
 * satu berkas ungu: filter itu memaksa warna apa pun jadi putih polos, jadi
 * logo dua warna tidak bisa dibedakan lagi di mode gelap.
 */
export function Logo({ className }: LogoProps) {
  const gelap = useTemaGelap();

  return (
    <img
      src={gelap ? logoGelap : logoTerang}
      alt={env.appName}
      width={592}
      height={96}
      decoding="async"
      className={cn('h-7 w-auto', className)}
    />
  );
}
