import { PADUKUHAN } from '@/lib/padukuhan';
import { cn } from '@/lib/utils';

const { koordinat, radiusPeta, namaLengkap } = PADUKUHAN;

const bbox = [
  koordinat.lon - radiusPeta,
  koordinat.lat - radiusPeta,
  koordinat.lon + radiusPeta,
  koordinat.lat + radiusPeta,
].join('%2C');

/**
 * Peta lokasi padukuhan.
 *
 * OpenStreetMap lewat `<iframe>`, BUKAN Leaflet/Google Maps: tidak ada
 * dependensi baru, tidak ada API key yang harus dibayar dan dirawat orang lain
 * setelah KKN. Syarat nol biaya proyek ini berlaku juga di sini.
 *
 * `loading="lazy"` supaya peta tidak ikut menahan render beranda — ia jauh di
 * bawah lipatan layar.
 */
export function PetaPadukuhan({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-slate-200 bg-slate-100 shadow-sm',
        className,
      )}
    >
      <iframe
        title={`Peta ${namaLengkap}`}
        loading="lazy"
        className="h-full w-full"
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${koordinat.lat}%2C${koordinat.lon}`}
      />
    </div>
  );
}
