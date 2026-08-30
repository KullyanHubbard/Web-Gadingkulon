import { cn } from '@/lib/utils';

/**
 * "Gading Si Galon" — maskot padukuhan, digambar sebagai SVG inline.
 *
 * SVG, bukan berkas PNG/JPG di `assets/`: maskotnya belum ada berkas resminya,
 * dan komponen yang menggambar sendiri tidak bisa hilang saat berkasnya lupa
 * di-commit. Kalau nanti ada ilustrasi resmi, ganti isi fungsi ini dengan satu
 * `<img>` — pemakainya tidak perlu diubah.
 */
export function Maskot({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 240"
      role="img"
      aria-label="Gading Si Galon, maskot Padukuhan Gading Kulon"
      className={cn('h-40 w-auto', className)}
    >
      {/* Air di dalam galon: gradasi biar tidak terbaca sebagai blok datar. */}
      <defs>
        <linearGradient id="maskot-air" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7dd3fc" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>

      {/* Bayangan di lantai — menempelkan maskot ke bidang, bukan melayang. */}
      <ellipse cx="100" cy="228" rx="52" ry="8" fill="#000" opacity="0.12" />

      {/* Tutup & leher galon */}
      <rect x="78" y="10" width="44" height="16" rx="6" fill="#3b1368" />
      <rect x="84" y="24" width="32" height="16" fill="#c4b5fd" />

      {/* Badan galon */}
      <path
        d="M62 44 h76 a16 16 0 0 1 16 16 v140 a16 16 0 0 1 -16 16 h-76 a16 16 0 0 1 -16 -16 v-140 a16 16 0 0 1 16 -16 z"
        fill="#e0f2fe"
        stroke="#3b1368"
        strokeWidth="6"
      />
      <path
        d="M62 96 h76 a4 4 0 0 1 4 4 v96 a12 12 0 0 1 -12 12 h-60 a12 12 0 0 1 -12 -12 v-96 a4 4 0 0 1 4 -4 z"
        fill="url(#maskot-air)"
        opacity="0.85"
      />

      {/* Muka: mata, pipi, senyum. Sederhana supaya tetap terbaca di 40px. */}
      <circle cx="82" cy="80" r="7" fill="#1e293b" />
      <circle cx="118" cy="80" r="7" fill="#1e293b" />
      <circle cx="84" cy="77.5" r="2.4" fill="#fff" />
      <circle cx="120" cy="77.5" r="2.4" fill="#fff" />
      <circle cx="68" cy="92" r="6" fill="#fb7185" opacity="0.55" />
      <circle cx="132" cy="92" r="6" fill="#fb7185" opacity="0.55" />
      <path
        d="M86 96 q14 12 28 0"
        fill="none"
        stroke="#1e293b"
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Tangan melambai di kanan, tangan diam di kiri. */}
      <path
        d="M46 120 q-22 6 -24 26"
        fill="none"
        stroke="#3b1368"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <path
        d="M154 120 q24 -4 28 -26"
        fill="none"
        stroke="#3b1368"
        strokeWidth="9"
        strokeLinecap="round"
      />
      <circle cx="182" cy="92" r="9" fill="#3b1368" />

      {/* Kaki */}
      <path
        d="M80 216 v10 M120 216 v10"
        stroke="#3b1368"
        strokeWidth="9"
        strokeLinecap="round"
      />
    </svg>
  );
}
