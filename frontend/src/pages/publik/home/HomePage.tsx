import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Building2, Newspaper } from 'lucide-react';
import { buttonClass } from '@/components/ui/button-class';
import { Card } from '@/components/ui/Card';
import { Maskot } from '@/components/ui/Maskot';
import { PetaPadukuhan } from '@/components/ui/PetaPadukuhan';
import { QueryBoundary } from '@/components/ui/QueryBoundary';
import { StatCard } from '@/components/ui/StatCard';
import { BeritaCard } from '@/features/berita/components/BeritaCard';
import { useBeritaList } from '@/features/berita/hooks/use-berita';
import { useStatistikPublik } from '@/features/statistik-publik/hooks/use-statistik-publik';
import ikonKeluarga from '@/assets/icons/keluarga.png';
import ikonLakiLaki from '@/assets/icons/laki-laki.png';
import ikonPenduduk from '@/assets/icons/penduduk.png';
import ikonPerempuan from '@/assets/icons/perempuan.png';
import { PADUKUHAN } from '@/lib/padukuhan';
import { formatAngka } from '@/lib/utils';
import { paths } from '@/routes/paths';

/** Lebar isi seluruh halaman publik — sama di setiap bagian. */
const WADAH = 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8';

/**
 * Latar hero: siluet Gunung Merapi sebagai SVG, bukan berkas foto.
 *
 * Fotonya belum ada di repo, dan `<img>` yang berkasnya tidak ikut ter-commit
 * meninggalkan kotak kosong di bagian paling atas situs. Untuk menggantinya
 * dengan foto asli nanti: taruh berkasnya di `src/assets/`, impor, lalu ganti
 * seluruh `<svg>` ini dengan satu `<img className="h-full w-full object-cover">`
 * — gradasi gelap di atasnya sudah terpisah, jadi tidak perlu diubah.
 */
function LatarMerapi() {
  return (
    <svg
      viewBox="0 0 1440 520"
      preserveAspectRatio="xMidYMax slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="hero-langit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2E1065" />
          <stop offset="55%" stopColor="#5B21B6" />
          <stop offset="100%" stopColor="#9d5fb0" />
        </linearGradient>
        <linearGradient id="hero-gunung" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4c2a6b" />
          <stop offset="100%" stopColor="#2b1442" />
        </linearGradient>
      </defs>

      <rect width="1440" height="520" fill="url(#hero-langit)" />
      <circle cx="1180" cy="120" r="46" fill="#fde68a" opacity="0.85" />

      {/* Punggungan belakang — lebih pucat, memberi kedalaman. */}
      <path
        d="M-40 430 L240 300 L420 380 L620 250 L820 390 L1040 290 L1240 380 L1480 300 L1480 520 L-40 520 Z"
        fill="#3b1368"
        opacity="0.55"
      />
      {/* Merapi: kerucut utama dengan puncak terpotong dan gumpalan asap. */}
      <path
        d="M330 520 L690 176 L700 168 L712 176 L1090 520 Z"
        fill="url(#hero-gunung)"
      />
      <path
        d="M660 210 L700 172 L742 210 L716 224 L684 214 Z"
        fill="#e9d5ff"
        opacity="0.45"
      />
      <ellipse
        cx="706"
        cy="152"
        rx="42"
        ry="20"
        fill="#f5f3ff"
        opacity="0.28"
      />
      <ellipse cx="748" cy="126" rx="30" ry="15" fill="#f5f3ff" opacity="0.2" />

      {/* Bidang sawah di kaki gunung. */}
      <path
        d="M-40 470 Q360 430 720 462 T1480 446 L1480 520 L-40 520 Z"
        fill="#1f3d2b"
      />
      <path
        d="M-40 496 Q400 466 760 492 T1480 480 L1480 520 L-40 520 Z"
        fill="#16301f"
      />
    </svg>
  );
}

function KartuJelajah({
  ke,
  judul,
  deskripsi,
  ikon,
}: {
  ke: string;
  judul: string;
  deskripsi: string;
  ikon: ReactNode;
}) {
  return (
    <Link
      to={ke}
      className="focus-ring group flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-700 transition-colors group-hover:bg-brand-600 group-hover:text-white">
        {ikon}
      </span>
      <h3 className="mt-4 text-lg font-bold text-slate-900">{judul}</h3>
      <p className="mt-2 flex-1 text-sm text-slate-600">{deskripsi}</p>
      <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-700">
        Buka halaman
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

function JudulBagian({
  judul,
  deskripsi,
  aksi,
}: {
  judul: string;
  deskripsi: string;
  aksi?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          {judul}
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">{deskripsi}</p>
      </div>
      {aksi}
    </div>
  );
}

/**
 * Beranda portal publik.
 *
 * Angka ringkasnya dari `/publik/statistik` (cacah saja, tanpa nama & alamat);
 * berita dari penyimpanan lokal — lihat `features/berita/api/berita-api.ts`.
 */
export default function HomePage() {
  const statistik = useStatistikPublik();
  const berita = useBeritaList();
  const tigaTerbaru = berita.data?.slice(0, 3) ?? [];

  return (
    <div className="flex flex-col">
      {/* ————————————————————————— Hero ————————————————————————— */}
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
              Portal data kependudukan, profil wilayah, dan kabar kegiatan warga
              — terbuka untuk siapa saja, di kaki Gunung Merapi,{' '}
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
              {/* Lingkaran lembut di belakang maskot: memisahkannya dari
                  siluet gunung yang warnanya berdekatan. */}
              <div
                className="absolute inset-0 -m-6 rounded-full bg-white/15 blur-xl"
                aria-hidden
              />
              <Maskot className="relative h-56 drop-shadow-2xl sm:h-64 lg:h-72" />
              <p className="relative mt-4 text-center text-sm font-semibold text-white">
                Halo! Aku{' '}
                <span className="text-amber-300">Gading Si Galon</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ——————————————————— Jelajahi Padukuhan ——————————————————— */}
      <section className={`${WADAH} py-16`}>
        <JudulBagian
          judul="Jelajahi Padukuhan"
          deskripsi="Tiga pintu masuk utama ke isi portal: siapa kami, angka-angkanya, dan apa yang sedang terjadi."
        />
        <div className="grid gap-6 md:grid-cols-3">
          <KartuJelajah
            ke={paths.profil}
            judul="Profil Desa"
            deskripsi="Sejarah singkat, struktur organisasi padukuhan, batas wilayah, dan luas wilayah."
            ikon={<Building2 className="h-6 w-6" />}
          />
          <KartuJelajah
            ke={paths.infografis}
            judul="Infografis"
            deskripsi="Demografi penduduk — usia, pekerjaan, status perkawinan, agama — serta sebaran penerima bantuan sosial."
            ikon={<BarChart3 className="h-6 w-6" />}
          />
          <KartuJelajah
            ke={paths.berita}
            judul="Berita & Kegiatan"
            deskripsi="Kabar kerja bakti, posyandu, penyaluran bantuan, dan agenda warga lainnya."
            ikon={<Newspaper className="h-6 w-6" />}
          />
        </div>
      </section>

      {/* ——————————————— Administrasi Penduduk ——————————————— */}
      <section className="border-y border-slate-200 bg-white py-16">
        <div className={WADAH}>
          <JudulBagian
            judul="Administrasi Penduduk"
            deskripsi="Ringkasan data kependudukan padukuhan. Angka ini cacah saja — nama dan alamat warga tidak pernah dibuka ke publik."
            aksi={
              <Link
                to={paths.statistik}
                className={buttonClass({ variant: 'outline' })}
              >
                Lihat rincian per RW
              </Link>
            }
          />

          <QueryBoundary
            isLoading={statistik.isLoading}
            isError={statistik.isError}
            data={statistik.data}
            loadingLabel="Memuat ringkasan penduduk"
            errorMessage="Ringkasan penduduk belum bisa ditampilkan."
          >
            {(data) => (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  label="Total Penduduk"
                  value={formatAngka(data.totalPenduduk)}
                  icon={ikonPenduduk}
                />
                {/* "Jumlah KK" dihitung dari cacah kepala keluarga: nomor KK
                    sendiri memang tidak didata lagi (CLAUDE.md), jadi tidak ada
                    kartu keluarga untuk dihitung langsung. */}
                <StatCard
                  label="Jumlah KK"
                  value={formatAngka(data.totalKepalaKeluarga)}
                  icon={ikonKeluarga}
                />
                <StatCard
                  label="Laki-laki"
                  value={formatAngka(data.totalLakiLaki)}
                  icon={ikonLakiLaki}
                />
                <StatCard
                  label="Perempuan"
                  value={formatAngka(data.totalPerempuan)}
                  icon={ikonPerempuan}
                />
              </div>
            )}
          </QueryBoundary>
        </div>
      </section>

      {/* ————————————————————— Peta Padukuhan ————————————————————— */}
      <section className={`${WADAH} py-16`}>
        <JudulBagian
          judul="Peta Padukuhan"
          deskripsi={`${PADUKUHAN.namaLengkap}, ${PADUKUHAN.desa}, ${PADUKUHAN.kapanewon}, ${PADUKUHAN.kabupaten}.`}
        />
        <PetaPadukuhan className="h-[26rem]" />
      </section>

      {/* ————————————————————— Berita Terkini ————————————————————— */}
      <section className="border-t border-slate-200 bg-white py-16">
        <div className={WADAH}>
          <JudulBagian
            judul="Berita Terkini"
            deskripsi="Kabar terbaru dari kegiatan warga padukuhan."
            aksi={
              <Link
                to={paths.berita}
                className={buttonClass({ variant: 'outline' })}
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
            {() => (
              <div className="grid gap-6 md:grid-cols-3">
                {tigaTerbaru.map((b) => (
                  <BeritaCard key={b.id} berita={b} />
                ))}
              </div>
            )}
          </QueryBoundary>
        </div>
      </section>

      {/* Kartu penutup: satu ajakan terakhir ke statistik lengkap. */}
      <section className={`${WADAH} pb-16`}>
        <Card className="flex flex-wrap items-center justify-between gap-4 bg-brand-950 p-8 text-white">
          <div>
            <h2 className="text-xl font-bold">Butuh angka yang lebih rinci?</h2>
            <p className="mt-1 text-sm text-brand-200">
              Statistik warga bisa ditelusuri sampai tingkat RT, tanpa perlu
              masuk.
            </p>
          </div>
          <Link
            to={paths.statistik}
            className={buttonClass({
              className: 'bg-white text-brand-800 hover:bg-brand-50',
            })}
          >
            Buka Statistik Warga
          </Link>
        </Card>
      </section>
    </div>
  );
}
