import { PublicLandingLayout } from '@/components/layout/PublicLandingLayout';
import { StatistikNav } from '@/features/statistik-publik/components/StatistikNav';
import { StatistikPanel } from '@/features/statistik-publik/components/StatistikPanel';

/**
 * Landing publik: statistik padukuhan yang boleh dilihat siapa saja, tanpa
 * login. Jalur masuk warga hidup sebagai tautan "Masuk" di layout, menuju
 * `pages/login/LoginPage.tsx`.
 */
export default function LandingPage() {
  return (
    <PublicLandingLayout nav={<StatistikNav />}>
      <StatistikPanel />
    </PublicLandingLayout>
  );
}
