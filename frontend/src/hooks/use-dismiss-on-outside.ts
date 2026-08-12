import { useEffect, useRef, type RefObject } from 'react';

/**
 * Tutup elemen mengambang (dropdown, popover) saat pengguna menekan Escape
 * atau menunjuk di luar areanya.
 *
 * Perilaku ini generik dan tidak tahu apa pun soal tampilan — komponen cukup
 * memasang `ref` yang dikembalikan pada pembungkus terluarnya.
 */
export function useDismissOnOutside<T extends HTMLElement = HTMLElement>(
  active: boolean,
  onDismiss: () => void,
): RefObject<T> {
  const ref = useRef<T>(null);
  // Simpan callback di ref agar listener tidak dipasang ulang tiap render
  // hanya karena pemanggil mengoper fungsi inline.
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    if (!active) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onDismissRef.current();
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onDismissRef.current();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [active]);

  return ref;
}
