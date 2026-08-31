import { QueryBoundary } from '@/components/ui/QueryBoundary';
import { BeritaCard } from '@/features/berita/components/BeritaCard';
import { useBeritaList } from '@/features/berita/hooks/use-berita';
import { WADAH } from '@/components/layout/wadah';

/** Daftar berita publik: grid kartu, terbaru dulu. */
export default function BeritaListPage() {
  const { data, isLoading, isError } = useBeritaList();

  return (
    <div className="flex flex-col">
      <section className="bg-brand-950 py-14 text-white">
        <div className={WADAH}>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-300">
            Berita
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Kabar & Kegiatan Warga
          </h1>
        </div>
      </section>

      <section className={`${WADAH} py-12`}>
        <QueryBoundary
          isLoading={isLoading}
          isError={isError}
          data={data}
          isEmpty={(d) => d.length === 0}
          loadingLabel="Memuat berita"
          errorMessage="Berita belum bisa ditampilkan."
          emptyTitle="Belum ada berita"
          emptyDescription="Kabar kegiatan padukuhan akan muncul di sini."
        >
          {(daftar) => (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {daftar.map((b) => (
                <BeritaCard key={b.id} berita={b} />
              ))}
            </div>
          )}
        </QueryBoundary>
      </section>
    </div>
  );
}
