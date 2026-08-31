import { BarChart3, Building2, Newspaper } from 'lucide-react';
import { WADAH } from '@/components/layout/wadah';
import { PetaPadukuhan } from '@/components/ui/PetaPadukuhan';
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
        <JudulBagian judul="JELAJAHI PADUKUHAN" className="uppercase" />
        <div className="grid gap-6 md:grid-cols-3">
          <KartuJelajah
            ke={paths.profil}
            judul="Profil Padukuhan"
            deskripsi="Struktur kelembagaan dan informasi wilayah."
            ikon={<Building2 className="h-6 w-6" />}
          />
          <KartuJelajah
            ke={paths.infografis}
            judul="Statistik Kependudukan"
            deskripsi="Visualisasi data demografi dan sebaran warga."
            ikon={<BarChart3 className="h-6 w-6" />}
          />
          <KartuJelajah
            ke={paths.berita}
            judul="Kabar & Agenda Warga"
            deskripsi="Informasi kegiatan terkini dan agenda masyarakat."
            ikon={<Newspaper className="h-6 w-6" />}
          />
        </div>
      </section>

      <RingkasanPenduduk />

      <section className={`${WADAH} py-16`}>
        <JudulBagian
          judul="PETA PADUKUHAN"
          className="uppercase"
        />
        <PetaPadukuhan className="h-[26rem]" />
      </section>

      <BeritaTerkini />
    </div>
  );
}
