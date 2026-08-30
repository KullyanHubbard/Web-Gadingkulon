import { Link } from 'react-router-dom';
import { BarChart3, Building2, Newspaper } from 'lucide-react';
import { WADAH } from '@/components/layout/wadah';
import { buttonClass } from '@/components/ui/button-class';
import { Card } from '@/components/ui/Card';
import { PetaPadukuhan } from '@/components/ui/PetaPadukuhan';
import { PADUKUHAN } from '@/lib/padukuhan';
import { paths } from '@/routes/paths';
import { BeritaTerkini } from './components/BeritaTerkini';
import { HeroBeranda } from './components/HeroBeranda';
import { JudulBagian } from './components/JudulBagian';
import { KartuJelajah } from './components/KartuJelajah';
import { RingkasanPenduduk } from './components/RingkasanPenduduk';

/**
 * Beranda portal publik — perakit bagian, tanpa state sendiri.
 *
 * Tiap bagian yang butuh data memanggil hook-nya sendiri (`RingkasanPenduduk`,
 * `BeritaTerkini`): kalau query-nya diangkat ke sini, satu bagian yang lambat
 * ikut menahan seluruh halaman.
 */
export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroBeranda />

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

      <RingkasanPenduduk />

      <section className={`${WADAH} py-16`}>
        <JudulBagian
          judul="Peta Padukuhan"
          deskripsi={`${PADUKUHAN.namaLengkap}, ${PADUKUHAN.desa}, ${PADUKUHAN.kapanewon}, ${PADUKUHAN.kabupaten}.`}
        />
        <PetaPadukuhan className="h-[26rem]" />
      </section>

      <BeritaTerkini />

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
