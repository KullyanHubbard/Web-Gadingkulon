import { useEffect, useRef, useState } from 'react';
import { PADUKUHAN } from '@/lib/padukuhan';
import { cn } from '@/lib/utils';

const { koordinat, radiusPeta, namaLengkap } = PADUKUHAN;

const bbox = [
  koordinat.lon - radiusPeta,
  koordinat.lat - radiusPeta,
  koordinat.lon + radiusPeta,
  koordinat.lat + radiusPeta,
].join('%2C');

const SUMBER = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${koordinat.lat}%2C${koordinat.lon}`;

/**
 * Peta lokasi padukuhan.
 *
 * OpenStreetMap lewat `<iframe>`, BUKAN Leaflet/Google Maps: tidak ada
 * dependensi baru, tidak ada API key yang harus dibayar dan dirawat orang lain
 * setelah KKN. Syarat nol biaya proyek ini berlaku juga di sini.
 *
 * **`<iframe>` baru dipasang setelah kotaknya masuk layar**, bukan
 * `loading="lazy"`. Dua alasan, dan keduanya gejala "petanya kadang tidak
 * muncul":
 *
 * 1. `loading="lazy"` menyerahkan waktu muat ke heuristik peramban, dan
 *    heuristik itu kadang melewatkan iframe yang sudah terlihat sejak awal —
 *    kotaknya tinggal kosong sampai halaman digulir.
 * 2. Peta di dalam embed menghitung tingkat zoom-nya SEKALI, dari ukuran
 *    iframe saat itu. Dimuat selagi kotaknya belum punya ukuran final, ia
 *    memilih zoom paling jauh dan tidak pernah menyesuaikan lagi — itu
 *    penjelasan peta yang muncul memperlihatkan separuh provinsi alih-alih
 *    satu padukuhan.
 *
 * Menunggu perpotongan menjamin dua-duanya: elemennya pasti sudah punya
 * ukuran, dan pemuatannya tetap ditunda sampai perlu.
 */
export function PetaPadukuhan({ className }: { className?: string }) {
  const kotak = useRef<HTMLDivElement>(null);
  const [tampil, setTampil] = useState(false);

  useEffect(() => {
    const elemen = kotak.current;
    if (!elemen) return;

    // `rootMargin` memberi jarak ancang-ancang: petanya sudah selesai dimuat
    // saat betulan sampai di layar, bukan mulai memuat pada detik itu.
    const pantau = new IntersectionObserver(
      (entri) => {
        if (!entri.some((e) => e.isIntersecting)) return;
        setTampil(true);
        pantau.disconnect();
      },
      { rootMargin: '300px' },
    );

    pantau.observe(elemen);
    return () => pantau.disconnect();
  }, []);

  return (
    <div
      ref={kotak}
      className={cn(
        'overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm',
        className,
      )}
    >
      {tampil && (
        <iframe
          title={`Peta ${namaLengkap}`}
          className="h-full w-full"
          src={SUMBER}
        />
      )}
    </div>
  );
}
