import { Link } from 'react-router-dom';
import { WADAH } from '@/components/layout/wadah';
import { buttonClass } from '@/components/ui/button-class';
import { QueryBoundary } from '@/components/ui/QueryBoundary';
import { BeritaCard } from '@/features/berita/components/BeritaCard';
import { useBeritaList } from '@/features/berita/hooks/use-berita';
import { paths } from '@/routes/paths';
import { JudulBagian } from './JudulBagian';

/** Berapa berita terbaru yang muncul di beranda. */
const CACAH_TAMPIL = 3;

/**
 * Tiga berita terbaru. Sumbernya penyimpanan lokal — lihat
 * `features/berita/api/berita-api.ts`.
 */
export function BeritaTerkini() {
  const berita = useBeritaList();

  return (
    <section className="border-t border-slate-200 bg-surface py-16">
      <div className={WADAH}>
        <JudulBagian
          judul="BERITA TERKINI"
          className="uppercase"
          aksi={
            <Link
              to={paths.berita}
              className={buttonClass({ variant: 'primary' })}
            >
              Lihat Semua Berita
            </Link>
          }
        />

        <QueryBoundary
          isLoading={berita.isLoading}
          isError={berita.isError}
          data={berita.data}
          isEmpty={(d) => d.length === 0}
          loadingLabel="Memuat berita"
          errorMessage="Berita belum bisa ditampilkan."
          emptyTitle="Belum ada berita"
          emptyDescription="Kabar kegiatan padukuhan akan muncul di sini."
        >
          {(daftar) => (
            <div className="grid gap-6 md:grid-cols-3">
              {daftar.slice(0, CACAH_TAMPIL).map((b) => (
                <BeritaCard key={b.id} berita={b} />
              ))}
            </div>
          )}
        </QueryBoundary>
      </div>
    </section>
  );
}
