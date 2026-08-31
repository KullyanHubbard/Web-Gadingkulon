import { Link } from 'react-router-dom';
import { WADAH } from '@/components/layout/wadah';
import { buttonClass } from '@/components/ui/button-class';
import { PADUKUHAN } from '@/lib/padukuhan';
import { paths } from '@/routes/paths';
import latarHero from '@/assets/hero-beranda.webp';

/** Bagian paling atas beranda: foto Merapi, sambutan, dan dua tombol. */
export function HeroBeranda() {
  return (
    <section className="relative isolate overflow-hidden">
      {/* `object-cover`: fotonya 1170x781, jauh lebih jangkung dari kotak hero,
          jadi yang kepotong atas-bawah — bukan diregangkan. */}
      <img
        src={latarHero}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        aria-hidden
      />
      {/* Gradasi gelap terpisah dari fotonya supaya kontras teks tidak ikut
          berubah kalau fotonya diganti lagi. */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#3b1368]/90 via-[#3b1368]/70 to-transparent"
        aria-hidden
      />

      {/* Satu kolom sejak maskotnya dicabut. Teksnya dijaga selebar setengah
          layar supaya tetap duduk di sisi foto yang digelapkan gradasi. */}
      <div className={`${WADAH} relative py-14 sm:py-20 lg:py-28`}>
        <div className="max-w-2xl text-center lg:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-200 sm:text-sm">
            {PADUKUHAN.desa} · {PADUKUHAN.kapanewon}
          </p>
          <h1 className="mt-3 text-2xl font-bold leading-tight text-white sm:mt-4 sm:text-4xl lg:text-5xl">
            Selamat Datang di Website Resmi{' '}
            <span className="text-amber-300">{PADUKUHAN.namaLengkap}</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-brand-100 sm:mt-5 sm:text-base lg:mx-0">
            Pusat informasi resmi layanan kependudukan, statistik wilayah, dan
            kabar kegiatan masyarakat {PADUKUHAN.namaLengkap}, {PADUKUHAN.desa}.
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Link
              to={paths.profil}
              className={buttonClass({
                size: 'lg',
                className: 'w-full bg-white text-brand-800 hover:bg-brand-50 sm:w-auto',
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
                  'w-full border-white/70 bg-transparent text-white hover:bg-white/10 sm:w-auto',
              })}
            >
              Statistik
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
