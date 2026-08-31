import type { CSSProperties } from 'react';
import { QueryBoundary } from '@/components/ui/QueryBoundary';
import { useStrukturOrganisasi } from '@/features/struktur-organisasi/hooks/use-struktur-organisasi';
import type { RwPublik } from '@/features/struktur-organisasi/types';
import { cn } from '@/lib/utils';

/**
 * Garis rambut bagan. `w-px`/`border-1`, BUKAN `border` telanjang — di proyek
 * ini `borderWidth.DEFAULT` disetel 4px (lihat `tailwind.config.js`), jadi
 * `border` polos menghasilkan garis setebal batang korek.
 */
const GARIS = 'bg-slate-400';

/** Mata panah, dicetak dengan `clip-path` supaya tidak perlu berkas SVG. */
const PANAH =
  'h-1.5 w-2.5 bg-slate-400 [clip-path:polygon(50%_100%,0_0,100%_0)]';

/**
 * Kotak jabatan: bingkai ganda, teks kapital, dua baris — jabatan di atas,
 * nama di bawah. Bentuk papan struktur yang dipakai balai desa.
 */
function Kotak({
  label,
  nama,
  utama = false,
  putus = false,
}: {
  label: string;
  /** `null`/kosong berarti jabatan itu belum ada akun aktifnya. */
  nama: string | null;
  /** Kotak puncak (Dukuh): bingkai lebih tegas. */
  utama?: boolean;
  /** Bingkai putus-putus untuk jabatan yang hubungannya koordinasi. */
  putus?: boolean;
}) {
  const kosong = !nama || nama.trim() === '';

  return (
    <div
      className={cn(
        // `h-full flex` + `flex-1` di bingkai dalam: sel grid diregangkan
        // setinggi baris, dan tanpa ini bingkai dalam kotak yang namanya tidak
        // ikut turun baris menyisakan ruang kosong di bawahnya.
        // `min-h-20`: tiap grup RW punya grid RT sendiri, jadi tinggi barisnya
        // dihitung terpisah — tanpa lantai ini kotak yang namanya turun baris
        // jadi lebih jangkung daripada kotak di grup sebelahnya.
        'flex min-h-24 w-full flex-col bg-surface p-1',
        'border-1',
        putus && 'border-dashed',
        utama ? 'border-slate-900' : 'border-slate-400',
      )}
    >
      <div
        className={cn(
          'flex flex-1 flex-col justify-center border-1 px-3 py-2.5 text-center',
          putus && 'border-dashed',
          utama ? 'border-slate-900' : 'border-slate-300',
        )}
      >
        <p className="text-[0.7rem] font-bold uppercase tracking-wider text-brand-700">
          {label}
        </p>
        {/* Nama kosong ditandai terang-terangan, bukan disamarkan: bagan ini
            terbuka untuk umum, jadi lebih baik jelas belum diisi daripada
            terlihat seolah sudah benar. */}
        <p
          className={cn(
            'mt-0.5 text-sm font-bold uppercase leading-snug',
            kosong ? 'italic text-slate-400' : 'text-slate-900',
          )}
        >
          {kosong ? 'Belum diisi' : nama}
        </p>
      </div>
    </div>
  );
}

/** Ruas tegak polos antar-tingkat. */
function Tiang({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn('block h-6 w-px', GARIS, className)} />
  );
}

/** Ruas tegak yang berujung mata panah — dipakai versi ponsel yang menumpuk. */
function TiangPanah({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn('flex flex-col items-center', className)}>
      <span className={cn('block h-6 w-px', GARIS)} />
      <span className={PANAH} />
    </span>
  );
}

/**
 * Palang mendatar yang mencabang jadi beberapa turunan berpanah — satu turunan
 * tepat di atas tiap kotak anak.
 *
 * Dibentuk per kolom (setengah garis di ujung, penuh di tengah), jadi jumlah
 * anaknya boleh berubah tanpa menghitung ulang posisi persen. Celah grid
 * (`gap-x-4` = 16px) dijembatani dengan menjulurkan garis 8px ke luar sel —
 * kalau tidak, palangnya putus tepat di setiap celah.
 *
 * Satu anak berarti `left-1/2` dan `right-1/2` berlaku sekaligus: palangnya
 * jadi selebar nol, dan itu memang benar — tidak ada yang perlu dijembatani.
 */
function PalangKeAnak({ jumlah }: { jumlah: number }) {
  return (
    <div
      aria-hidden
      className="grid w-full gap-x-4 [grid-template-columns:repeat(var(--n),minmax(0,1fr))]"
      style={{ '--n': jumlah } as CSSProperties}
    >
      {Array.from({ length: jumlah }, (_, i) => (
        <div key={i} className="relative h-8">
          <span
            className={cn(
              'absolute top-0 h-px',
              GARIS,
              i === 0 ? 'left-1/2' : '-left-2',
              i === jumlah - 1 ? 'right-1/2' : '-right-2',
            )}
          />
          <span
            className={cn(
              'absolute left-1/2 top-0 h-[calc(100%-0.375rem)] w-px',
              GARIS,
            )}
          />
          <span
            className={cn('absolute bottom-0 left-1/2 -translate-x-1/2', PANAH)}
          />
        </div>
      ))}
    </div>
  );
}

/** Satu RW beserta kotak-kotak RT yang mengipas di bawahnya. */
function GrupRw({ wilayah }: { wilayah: RwPublik }) {
  return (
    <div className="flex w-full flex-col items-center">
      <Kotak label={`RW ${wilayah.nomor}`} nama={wilayah.nama} />
      <Tiang />
      <PalangKeAnak jumlah={wilayah.rt.length} />
      <div
        className="grid w-full gap-x-4 [grid-template-columns:repeat(var(--n),minmax(0,1fr))]"
        style={{ '--n': wilayah.rt.length } as CSSProperties}
      >
        {wilayah.rt.map((rt) => (
          <Kotak key={rt.nomor} label={`RT ${rt.nomor}`} nama={rt.nama} />
        ))}
      </div>
    </div>
  );
}

/**
 * Bagan pengurus Padukuhan Gading Kulon — bentuk papan struktur: kotak
 * berbingkai, palang mendatar, panah turun ke tiap bawahan.
 *
 * Dukuh, RW/RT, & LPM semuanya dari `/publik/struktur-organisasi` — sumber
 * yang sama dipakai halaman kelola akun Admin, jadi pergantian jabatan yang
 * disetujui dan perubahan nama Ketua LPM otomatis terlihat di sini tanpa
 * deploy ulang. LPM tetap bukan salah satu dari empat peran akun, jadi tidak
 * ikut sistem ganti-jabatan yang disetujui — hanya sumber datanya yang kini
 * sama dengan yang lain.
 *
 * LPM menempel ke Dukuh lewat GARIS PUTUS-PUTUS. Bedanya bukan hiasan: di
 * bagan pemerintahan garis lurus berarti komando dan putus-putus berarti
 * koordinasi, dan LPM memang tidak membawahi RW/RT.
 *
 * Di bawah `md` tiap RW menumpuk — palang bercabangnya diganti tiang berpanah
 * per grup. Bentuk kotak-dan-panahnya tetap sama di tiap tingkat, dan dua
 * kotak RT masih muat berdampingan di layar 390px, jadi tidak ada gulung
 * mendatar sama sekali. Pembacanya mayoritas di ponsel.
 */
export function BaganOrganisasi() {
  const { data, isLoading, isError } = useStrukturOrganisasi();

  return (
    // TANPA `isEmpty`: Dukuh & LPM bukan turunan RW/RT — keduanya tetap berarti
    // ditampilkan (dengan "Belum diisi" bila kosong) meski `rw` belum ada
    // satu pun, sebelum data warga diimpor. `rw.length === 0` bukan kegagalan,
    // cuma bagian bagan yang belum punya isi — ditangani di dalam, bukan
    // dengan mengganti seluruh bagan jadi pesan "tidak ada data".
    <QueryBoundary
      isLoading={isLoading}
      isError={isError}
      data={data}
      loadingLabel="Memuat struktur organisasi"
      errorMessage="Struktur organisasi belum bisa ditampilkan."
    >
      {(struktur) => (
        <figure className="m-0">
          <div className="mx-auto flex max-w-5xl flex-col items-center">
            <div className="w-64">
              <Kotak label="Dukuh" nama={struktur.dukuh} utama />
            </div>

            {/* Garis komando Dukuh -> RW tidak boleh putus saat melewati baris
                ini: LPM MENCABANG dari garis itu, bukan menyela. */}
            <Tiang />
            <div className="relative flex w-full flex-col items-center md:flex-row md:justify-center">
              <span
                aria-hidden
                className={cn(
                  'absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 md:block',
                  GARIS,
                )}
              />
              <span
                aria-hidden
                className="block h-5 border-l-1 border-dashed border-slate-400 md:hidden"
              />
              <div className="hidden flex-1 md:block" />
              <div className="flex w-full items-center md:w-1/2">
                <span
                  aria-hidden
                  className="hidden flex-1 border-t-1 border-dashed border-slate-400 md:block"
                />
                <div className="w-56">
                  <Kotak label="Ketua LPM" nama={struktur.lpm} putus />
                </div>
                <span aria-hidden className="hidden flex-1 md:block" />
              </div>
            </div>
            {struktur.rw.length === 0 ? (
              // `repeat(0, ...)` bukan CSS yang sah — grid RW di bawah ini
              // butuh minimal satu kolom, jadi belum ada RW ditangani sebagai
              // cabang terpisah, bukan dengan memaksa `jumlah={0}` ke `PalangKeAnak`.
              <>
                <Tiang />
                <p className="max-w-xs text-center text-xs text-slate-400">
                  Data RW/RT belum diimpor.
                </p>
              </>
            ) : (
              <>
                <Tiang />

                <div className="hidden w-full md:block">
                  <PalangKeAnak jumlah={struktur.rw.length} />
                </div>

                <div
                  className="grid w-full grid-cols-1 gap-x-4 gap-y-2 md:[grid-template-columns:repeat(var(--n),minmax(0,1fr))]"
                  style={{ '--n': struktur.rw.length } as CSSProperties}
                >
                  {struktur.rw.map((w) => (
                    <div key={w.nomor} className="flex flex-col items-center">
                      <TiangPanah className="md:hidden" />
                      <GrupRw wilayah={w} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </figure>
      )}
    </QueryBoundary>
  );
}
