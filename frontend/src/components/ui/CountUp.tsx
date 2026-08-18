import { useEffect, useState } from 'react';
import { formatAngka } from '@/lib/utils';

/** Cukup untuk terbaca sebagai gerakan, belum sampai menunda pembacaan angka. */
const DURASI_MS = 900;

interface CountUpProps {
  value: number;
  className?: string;
}

/**
 * Angka yang beranjak dari 0 ke `value` saat muncul.
 *
 * Komponen, bukan hook, karena satu-satunya pemakainya menyusun angka ini di
 * dalam render-prop `QueryBoundary` — hook yang dipanggil di sana akan terdaftar
 * pada `QueryBoundary` dan cuma jalan saat datanya ada, melanggar rules of hooks.
 *
 * `requestAnimationFrame` langsung, bukan pustaka animasi: satu angka menaik
 * tidak sepadan dengan menambah dependensi yang harus dirawat setelah KKN.
 *
 * Pemformatan ada di sini (bukan di view-model seperti angka lain) karena tiap
 * bingkai punya nilainya sendiri — view-model tidak bisa menyiapkan 900 string.
 */
export function CountUp({ value, className }: CountUpProps) {
  const [tampil, setTampil] = useState(0);

  useEffect(() => {
    // Wajib dihormati: bagi sebagian orang gerakan begini memicu pusing/mual.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTampil(value);
      return;
    }

    let frame = 0;
    const mulai = performance.now();

    const langkah = (kini: number) => {
      const t = Math.min((kini - mulai) / DURASI_MS, 1);
      // Ease-out kubik: deras di awal lalu mengerem, jadi angka akhirnya sempat
      // terbaca. Linear terlihat seperti odometer yang berhenti mendadak.
      setTampil(Math.round(value * (1 - (1 - t) ** 3)));
      if (t < 1) frame = requestAnimationFrame(langkah);
    };

    frame = requestAnimationFrame(langkah);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <span className={className}>{formatAngka(tampil)}</span>;
}
