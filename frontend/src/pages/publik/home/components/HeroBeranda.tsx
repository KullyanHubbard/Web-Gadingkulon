import { Link } from 'react-router-dom';
import { WADAH } from '@/components/layout/wadah';
import { buttonClass } from '@/components/ui/button-class';
import { Maskot } from '@/components/ui/Maskot';
import { PADUKUHAN } from '@/lib/padukuhan';
import { paths } from '@/routes/paths';
import { LatarMerapi } from './LatarMerapi';

/** Bagian paling atas beranda: sambutan, dua tombol, dan maskot. */
export function HeroBeranda() {
  return (
    <section className="relative isolate overflow-hidden">
      <LatarMerapi />
      {/* Gradasi gelap terpisah dari latarnya: kalau nanti latar diganti foto,
          kontras teksnya tidak ikut hilang. */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#3b1368]/90 via-[#3b1368]/70 to-transparent"
        aria-hidden
      />

      <div
        className={`${WADAH} relative flex flex-col-reverse items-center gap-8 py-16 lg:flex-row lg:py-24`}
      >
        <div className="flex-1 text-center lg:text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-200">
            {PADUKUHAN.desa} · {PADUKUHAN.kapanewon}
          </p>
          <h1 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-5xl">
            Selamat Datang di Website Resmi{' '}
            <span className="text-amber-300">{PADUKUHAN.namaLengkap}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-brand-100 lg:mx-0">
            Portal data kependudukan, profil wilayah, dan kabar kegiatan warga —
            terbuka untuk siapa saja, di kaki Gunung Merapi,{' '}
            {PADUKUHAN.provinsi}.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            <Link
              to={paths.profil}
              className={buttonClass({
                size: 'lg',
                className: 'bg-white text-brand-800 hover:bg-brand-50',
              })}
            >
              Jelajahi Padukuhan
            </Link>
            <Link
              to={paths.statistik}
              className={buttonClass({
                size: 'lg',
                variant: 'outline',
                className:
                  'border-white/70 bg-transparent text-white hover:bg-white/10',
              })}
            >
              Statistik
            </Link>
          </div>
        </div>

        <div className="flex flex-1 justify-center">
          <div className="relative">
            {/* Lingkaran lembut di belakang maskot: memisahkannya dari siluet
                gunung yang warnanya berdekatan. */}
            <div
              className="absolute inset-0 -m-6 rounded-full bg-white/15 blur-xl"
              aria-hidden
            />
            <Maskot className="relative h-56 drop-shadow-2xl sm:h-64 lg:h-72" />
            <p className="relative mt-4 text-center text-sm font-semibold text-white">
              Halo! Aku <span className="text-amber-300">Gading Si Galon</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
