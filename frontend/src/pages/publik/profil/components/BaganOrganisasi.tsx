import { STRUKTUR_ORGANISASI, type PosisiOrganisasi } from '@/lib/padukuhan';

/** Satu kotak jabatan pada bagan. */
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

/**
 * Bagan pengurus padukuhan.
 *
 * `<ul>` bersarang, bukan SVG: susunannya memang daftar bertingkat, dan `<ul>`
 * sudah dibacakan pembaca layar sebagai hierarki tanpa perlu ARIA tambahan.
 *
 * Namanya datang dari konstanta `lib/padukuhan.ts`, BUKAN dari tabel
 * `pengurus` — daftar akun itu ada di balik login ADMIN, halaman ini terbuka
 * untuk siapa saja.
 */
export function BaganOrganisasi() {
  return (
    // Bagan lebih lebar dari layar ponsel; digulung mendatar di dalam kotaknya
    // sendiri supaya badan halaman tidak ikut bergeser.
    <div className="overflow-x-auto pb-4">
      <ul className="flex min-w-max flex-col items-center px-4">
        <CabangOrganisasi posisi={STRUKTUR_ORGANISASI} akar />
      </ul>
    </div>
  );
}
