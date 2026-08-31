import { WADAH } from '@/components/layout/wadah';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { PetaPadukuhan } from '@/components/ui/PetaPadukuhan';
import { QueryBoundary } from '@/components/ui/QueryBoundary';
import { useStatistikPublik } from '@/features/statistik-publik/hooks/use-statistik-publik';
import { BATAS_WILAYAH, PADUKUHAN, SEJARAH_PADUKUHAN } from '@/lib/padukuhan';
import { formatAngka } from '@/lib/utils';
import { BaganOrganisasi } from './components/BaganOrganisasi';
import { BarisKeterangan } from './components/BarisKeterangan';

/** Profil padukuhan: sejarah, bagan pengurus, peta, batas & luas wilayah. */
export default function ProfilPage() {
  const statistik = useStatistikPublik();

  return (
    <div className="flex flex-col">
      <section className="bg-brand-950 py-14 text-white">
        <div className={WADAH}>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-300">
            Profil
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            {PADUKUHAN.namaLengkap}
          </h1>
        </div>
      </section>

      <section className={`${WADAH} py-14`}>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-slate-900">
              Sejarah & Gambaran Umum
            </h2>
            <div className="mt-4 space-y-4 text-slate-700">
              {SEJARAH_PADUKUHAN.map((paragraf) => (
                <p key={paragraf.slice(0, 24)}>{paragraf}</p>
              ))}
            </div>
          </div>

          <Card className="h-fit">
            <CardHeader title="Data Wilayah" />
            <CardContent>
              <dl>
                <BarisKeterangan
                  label="Luas wilayah"
                  nilai={PADUKUHAN.luasWilayah}
                />
                {/* Populasi dari `/publik/statistik`, bukan angka tetap: kalau
                    ditulis manual ia langsung basi pada impor data berikutnya. */}
                <QueryBoundary
                  isLoading={statistik.isLoading}
                  isError={statistik.isError}
                  data={statistik.data}
                  loadingLabel="Memuat"
                  errorMessage="Jumlah penduduk belum bisa ditampilkan."
                >
                  {(data) => (
                    <>
                      <BarisKeterangan
                        label="Total populasi"
                        nilai={`${formatAngka(data.totalPenduduk)} jiwa`}
                      />
                      <BarisKeterangan
                        label="Jumlah RW"
                        nilai={`${data.perRw.length} RW`}
                      />
                      <BarisKeterangan
                        label="Jumlah RT"
                        nilai={`${data.perRw.reduce((n, rw) => n + rw.perRt.length, 0)} RT`}
                      />
                    </>
                  )}
                </QueryBoundary>
                <BarisKeterangan label="Kalurahan" nilai={PADUKUHAN.desa} />
                <BarisKeterangan
                  label="Kapanewon"
                  nilai={PADUKUHAN.kapanewon}
                />
              </dl>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-surface py-14">
        <div className={WADAH}>
          <h2 className="text-2xl font-bold text-slate-900">
            Struktur Organisasi Padukuhan
          </h2>
          <div className="mt-8">
            <BaganOrganisasi />
          </div>
        </div>
      </section>

      <section className={`${WADAH} py-14`}>
        <h2 className="mb-6 text-2xl font-bold text-slate-900">
          Peta & Letak Wilayah
        </h2>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <PetaPadukuhan className="h-[24rem]" />
          </div>

          <Card className="h-fit">
            <CardHeader
              title="Batas Wilayah"
              description="Wilayah yang berbatasan langsung"
            />
            <CardContent>
              <dl>
                {BATAS_WILAYAH.map((b) => (
                  <BarisKeterangan
                    key={b.arah}
                    label={`Sebelah ${b.arah}`}
                    nilai={b.wilayah}
                  />
                ))}
              </dl>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
