import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { PetaPadukuhan } from '@/components/ui/PetaPadukuhan';
import { QueryBoundary } from '@/components/ui/QueryBoundary';
import { useStatistikPublik } from '@/features/statistik-publik/hooks/use-statistik-publik';
import {
  BATAS_WILAYAH,
  PADUKUHAN,
  SEJARAH_PADUKUHAN,
  STRUKTUR_ORGANISASI,
  type PosisiOrganisasi,
} from '@/lib/padukuhan';
import { formatAngka } from '@/lib/utils';

const WADAH = 'mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8';

/**
 * Satu kotak jabatan pada bagan.
 *
 * Bagannya `<ul>` bersarang, bukan SVG: susunannya memang daftar bertingkat,
 * dan `<ul>` sudah dibacakan pembaca layar sebagai hierarki tanpa perlu ARIA
 * tambahan. Garis penghubungnya border CSS di `::before` — tidak ada elemen
 * mati yang cuma jadi garis.
 */
function KotakJabatan({ posisi }: { posisi: PosisiOrganisasi }) {
  return (
    <div className="inline-block min-w-[11rem] rounded-xl border border-slate-200 bg-white px-5 py-3 text-center shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
        {posisi.jabatan}
      </p>
      <p className="mt-1 font-bold text-slate-900">{posisi.nama}</p>
    </div>
  );
}

/**
 * Satu cabang bagan, rekursif — susunannya memang bersarang: Dukuh -> Ketua RW
 * -> Ketua RT, dan cabang Karang Taruna yang berbentuk sama.
 *
 * Garis penghubung ke atas dicetak simpul anak, bukan induknya: dengan begitu
 * simpul akar tidak butuh cabang kode sendiri untuk menghilangkannya.
 */
function CabangOrganisasi({
  posisi,
  akar = false,
}: {
  posisi: PosisiOrganisasi;
  akar?: boolean;
}) {
  return (
    <li className="flex list-none flex-col items-center">
      {!akar && <span aria-hidden className="h-6 w-px bg-slate-300" />}
      <KotakJabatan posisi={posisi} />

      {posisi.bawahan && posisi.bawahan.length > 0 && (
        <>
          <span aria-hidden className="h-6 w-px bg-slate-300" />
          <ul className="flex flex-col items-center gap-2 sm:flex-row sm:items-start sm:gap-8">
            {posisi.bawahan.map((anak) => (
              <CabangOrganisasi
                key={`${anak.jabatan}-${anak.nama}`}
                posisi={anak}
              />
            ))}
          </ul>
        </>
      )}
    </li>
  );
}

function BarisKeterangan({ label, nilai }: { label: string; nilai: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-slate-100 py-3 last:border-b-0">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="text-right font-semibold text-slate-900">{nilai}</dd>
    </div>
  );
}

/**
 * Profil padukuhan: sejarah, bagan pengurus, peta, batas & luas wilayah.
 *
 * Nama pengurus di bagan datang dari konstanta `lib/padukuhan.ts`, BUKAN dari
 * tabel `pengurus` — daftar akun itu ada di balik login ADMIN dan halaman ini
 * terbuka untuk siapa saja.
 */
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
          <p className="mt-3 max-w-2xl text-brand-200">
            {PADUKUHAN.desa}, {PADUKUHAN.kapanewon}, {PADUKUHAN.kabupaten},{' '}
            {PADUKUHAN.provinsi}
          </p>
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

      <section className="border-y border-slate-200 bg-white py-14">
        <div className={WADAH}>
          <h2 className="text-2xl font-bold text-slate-900">
            Struktur Organisasi Padukuhan
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Dukuh, pengurus RW dan RT, serta Karang Taruna.
          </p>

          {/* Bagan lebih lebar dari layar ponsel; digulung mendatar di dalam
              kotaknya sendiri supaya badan halaman tidak ikut bergeser. */}
          <div className="mt-8 overflow-x-auto pb-4">
            <ul className="flex min-w-max flex-col items-center px-4">
              <CabangOrganisasi posisi={STRUKTUR_ORGANISASI} akar />
            </ul>
          </div>
        </div>
      </section>

      <section className={`${WADAH} py-14`}>
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-slate-900">
              Peta & Letak Wilayah
            </h2>
            <PetaPadukuhan className="mt-4 h-[24rem]" />
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
