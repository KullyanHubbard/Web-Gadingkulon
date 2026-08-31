import { useEffect, useState } from 'react';

/**
 * `true` selagi kelas `dark` menempel di `<html>` — satu-satunya penanda tema
 * di proyek ini (lihat `TombolTema` & skrip anti-kedip di `index.html`).
 *
 * Dipantau lewat `MutationObserver`, bukan `localStorage` atau
 * `prefers-color-scheme`: keduanya bisa berbeda dari kelas yang benar-benar
 * terpasang, dan yang menentukan warna halaman adalah kelasnya.
 *
 * Keadaan awal dibaca langsung dari DOM supaya render pertama sudah benar —
 * kelasnya sudah dipasang skrip di `index.html` sebelum React mount.
 */
export function useTemaGelap(): boolean {
  const [gelap, setGelap] = useState(() =>
    document.documentElement.classList.contains('dark'),
  );

  useEffect(() => {
    const akar = document.documentElement;
    const pantau = new MutationObserver(() =>
      setGelap(akar.classList.contains('dark')),
    );
    pantau.observe(akar, { attributes: true, attributeFilter: ['class'] });
    return () => pantau.disconnect();
  }, []);

  return gelap;
}
