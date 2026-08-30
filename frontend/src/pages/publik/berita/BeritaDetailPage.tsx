import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, UserRound } from 'lucide-react';
import { buttonClass } from '@/components/ui/button-class';
import { Card, CardHeader } from '@/components/ui/Card';
import { QueryBoundary } from '@/components/ui/QueryBoundary';
import {
  BeritaBarisRingkas,
  FotoBerita,
} from '@/features/berita/components/BeritaCard';
import { useBerita, useBeritaList } from '@/features/berita/hooks/use-berita';
import { formatTanggal, keParagraf } from '@/features/berita/utils';
import { paths } from '@/routes/paths';
import { WADAH } from '@/components/layout/wadah';

/** Banyaknya berita lain di sidebar. Lebih dari ini kolomnya jadi lebih panjang dari artikelnya. */
const JUMLAH_TERKINI = 5;

/**
 * Satu berita: kolom utama di kiri, "Berita Terkini" di kanan.
 *
 * Dua query, bukan satu: daftar dipakai sidebar dan sudah ter-cache dari
 * halaman daftar, sedangkan detailnya dicari per slug. React Query
 * menggabungkan keduanya tanpa permintaan ekstra saat pembaca datang dari
 * `/berita`.
 */
export default function BeritaDetailPage() {
  const { slug = '' } = useParams();
  const { data, isLoading, isError } = useBerita(slug);
  const daftar = useBeritaList();

  const terkini = (daftar.data ?? [])
    .filter((b) => b.slug !== slug)
    .slice(0, JUMLAH_TERKINI);

  return (
    <div className={`${WADAH} py-10`}>
      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <article className="min-w-0">
          <QueryBoundary
            isLoading={isLoading}
            isError={isError}
            data={data}
            loadingLabel="Memuat berita"
            errorMessage="Berita belum bisa ditampilkan."
            emptyTitle="Berita tidak ditemukan"
            emptyDescription="Tautannya mungkin sudah berubah karena judulnya disunting."
          >
            {(berita) => (
              <>
                <h1 className="text-3xl font-bold leading-tight text-slate-900 sm:text-4xl">
                  {berita.judul}
                </h1>

                <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" aria-hidden />
                    {formatTanggal(berita.tanggalTerbit)}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <UserRound className="h-4 w-4" aria-hidden />
                    {berita.penulis}
                  </span>
                </div>

                <FotoBerita
                  berita={berita}
                  className="mt-6 h-64 w-full rounded-xl sm:h-96"
                />

                {/* `max-w-none` tidak dipakai lewat plugin typography — plugin
                    itu tidak terpasang. Jarak antar-paragraf disetel `space-y`. */}
                <div className="mt-8 space-y-4 text-base leading-relaxed text-slate-700">
                  {keParagraf(berita.isi).map((paragraf) => (
                    <p key={paragraf.slice(0, 32)}>{paragraf}</p>
                  ))}
                </div>

                <div className="mt-10 flex flex-wrap gap-3 border-t border-slate-200 pt-6">
                  <Link
                    to={paths.berita}
                    className={buttonClass({ variant: 'outline' })}
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden />
                    Kembali ke Berita
                  </Link>
                  <Link
                    to={paths.landing}
                    className={buttonClass({ variant: 'ghost' })}
                  >
                    Ke Beranda
                  </Link>
                </div>
              </>
            )}
          </QueryBoundary>
        </article>

        {/* Sidebar hanya dicetak kalau memang ada berita lain: kartu "Berita
            Terkini" yang isinya kosong cuma menyempitkan kolom artikel. */}
        {terkini.length > 0 && (
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <Card>
              <CardHeader title="Berita Terkini" />
              <div className="space-y-1 p-3">
                {terkini.map((b) => (
                  <BeritaBarisRingkas key={b.id} berita={b} />
                ))}
              </div>
            </Card>
          </aside>
        )}
      </div>
    </div>
  );
}
