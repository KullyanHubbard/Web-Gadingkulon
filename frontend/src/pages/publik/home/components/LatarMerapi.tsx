/**
 * Latar hero: siluet Gunung Merapi sebagai SVG, bukan berkas foto.
 *
 * Fotonya belum ada di repo, dan `<img>` yang berkasnya tidak ikut ter-commit
 * meninggalkan kotak kosong di bagian paling atas situs. Untuk menggantinya
 * dengan foto asli nanti: taruh berkasnya di `src/assets/`, impor, lalu ganti
 * seluruh `<svg>` ini dengan satu `<img className="h-full w-full object-cover">`
 * — gradasi gelap di atasnya sudah terpisah, jadi tidak perlu diubah.
 */
export function LatarMerapi() {
  return (
    <svg
      viewBox="0 0 1440 520"
      preserveAspectRatio="xMidYMax slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id="hero-langit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2E1065" />
          <stop offset="55%" stopColor="#5B21B6" />
          <stop offset="100%" stopColor="#9d5fb0" />
        </linearGradient>
        <linearGradient id="hero-gunung" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4c2a6b" />
          <stop offset="100%" stopColor="#2b1442" />
        </linearGradient>
      </defs>

      <rect width="1440" height="520" fill="url(#hero-langit)" />
      <circle cx="1180" cy="120" r="46" fill="#fde68a" opacity="0.85" />

      {/* Punggungan belakang — lebih pucat, memberi kedalaman. */}
      <path
        d="M-40 430 L240 300 L420 380 L620 250 L820 390 L1040 290 L1240 380 L1480 300 L1480 520 L-40 520 Z"
        fill="#3b1368"
        opacity="0.55"
      />
      {/* Merapi: kerucut utama dengan puncak terpotong dan gumpalan asap. */}
      <path
        d="M330 520 L690 176 L700 168 L712 176 L1090 520 Z"
        fill="url(#hero-gunung)"
      />
      <path
        d="M660 210 L700 172 L742 210 L716 224 L684 214 Z"
        fill="#e9d5ff"
        opacity="0.45"
      />
      <ellipse
        cx="706"
        cy="152"
        rx="42"
        ry="20"
        fill="#f5f3ff"
        opacity="0.28"
      />
      <ellipse cx="748" cy="126" rx="30" ry="15" fill="#f5f3ff" opacity="0.2" />

      {/* Bidang sawah di kaki gunung. */}
      <path
        d="M-40 470 Q360 430 720 462 T1480 446 L1480 520 L-40 520 Z"
        fill="#1f3d2b"
      />
      <path
        d="M-40 496 Q400 466 760 492 T1480 480 L1480 520 L-40 520 Z"
        fill="#16301f"
      />
    </svg>
  );
}
