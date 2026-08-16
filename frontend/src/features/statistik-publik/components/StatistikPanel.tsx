import { useStatistikPublik } from '../hooks/use-statistik-publik';
import { toRingkasanStatistik } from '../view-model';
import { StatistikPanelView } from './StatistikPanelView';

/**
 * Penghubung data untuk panel statistik publik.
 *
 * Satu-satunya tempat panel ini menyentuh React Query; tampilannya ada di
 * `StatistikPanelView` dan tidak tahu dari mana angkanya datang.
 */
export function StatistikPanel({
  onPilihRw,
}: {
  /** Buka rincian sebuah RW dari kartu ringkasan. */
  onPilihRw: (rw: string) => void;
}) {
  const { data, isLoading, isError } = useStatistikPublik();

  return (
    <StatistikPanelView
      isLoading={isLoading}
      isError={isError}
      ringkasan={data && toRingkasanStatistik(data)}
      onPilihRw={onPilihRw}
    />
  );
}
