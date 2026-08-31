import { useRef, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Sama dengan kunci di skrip anti-kedip pada `index.html`. */
const KUNCI = 'siduk.tema';

/** Kembar dengan durasi `.tema-beralih` di `styles/index.css`. */
const DURASI_MS = 300;

/** Dua ikon ditumpuk di titik yang sama; yang tidak aktif menyusut & berputar
 *  keluar. Menukar satu elemen (`gelap ? <Sun/> : <Moon/>`) tidak bisa
 *  dianimasikan — React mengganti node-nya, jadi tidak ada keadaan antara. */
const IKON =
  'absolute h-6 w-6 transition-all duration-300 motion-reduce:transition-none';

/**
 * Tombol mengambang: ganti mode terang / gelap.
 *
 * Kerjanya cuma menempel-lepas kelas `dark` di <html>. Warnanya sendiri diurus
 * satu blok `:root.dark` di `styles/index.css` yang membalik ramp abu-abu —
 * jadi tidak ada komponen lain yang perlu tahu soal tema ini.
 *
 * Kelas `tema-beralih` menyala selama peralihan saja supaya warna seluruh
 * halaman meluncur; lihat alasannya di `styles/index.css`.
 *
 * Pilihan pertama mengikuti setelan sistem (`prefers-color-scheme`); begitu
 * tombolnya dipakai sekali, pilihan manual itu yang menang seterusnya. Kelas
 * awalnya dipasang skrip di `index.html` sebelum React mount — kalau di sini,
 * halaman sempat berkedip putih dulu. Karena itu keadaan awal dibaca dari DOM,
 * bukan dari `localStorage` lagi.
 */
export function TombolTema() {
  const [gelap, setGelap] = useState(() =>
    document.documentElement.classList.contains('dark'),
  );
  // Diklik dua kali cepat: tanpa ini penghitung waktu yang pertama melepas
  // kelasnya di tengah peralihan kedua, dan warnanya melompat.
  const jedaRef = useRef<number>();

  const ganti = () => {
    const baru = !gelap;
    const akar = document.documentElement;

    akar.classList.add('tema-beralih');
    akar.classList.toggle('dark', baru);
    localStorage.setItem(KUNCI, baru ? 'gelap' : 'terang');
    setGelap(baru);

    window.clearTimeout(jedaRef.current);
    jedaRef.current = window.setTimeout(
      () => akar.classList.remove('tema-beralih'),
      DURASI_MS,
    );
  };

  return (
    <button
      type="button"
      onClick={ganti}
      aria-label={gelap ? 'Mode terang' : 'Mode gelap'}
      aria-pressed={gelap}
      className="focus-ring relative flex h-12 w-12 items-center justify-center rounded-full border-1 border-slate-200 bg-surface text-slate-700 shadow-lg transition-transform duration-200 hover:scale-110 active:scale-95 motion-reduce:transition-none motion-reduce:hover:scale-100"
    >
      <Moon
        aria-hidden
        className={cn(
          IKON,
          gelap ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100',
        )}
      />
      <Sun
        aria-hidden
        className={cn(
          IKON,
          gelap ? 'rotate-0 scale-100' : '-rotate-90 scale-0 opacity-0',
        )}
      />
    </button>
  );
}
