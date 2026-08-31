import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import type { Role } from '../types';

/**
 * Empat peran di halaman masuk, beserta contoh username tiap peran.
 *
 * Pilihan ini kini diverifikasi di layar masuk. Jika peran dari backend
 * tidak cocok dengan tombol yang ditekan, proses masuk akan dibatalkan
 * (sesi dicabut kembali) dan menampilkan error.
 */
export const PERAN_LOGIN = [
  {
    role: 'ADMIN' as Role,
    label: 'Admin',
    judul: 'Masuk sebagai Admin',
    contoh: 'admin',
    catatan: 'Mengelola akun pengurus. Tidak bisa melihat data warga.',
  },
  {
    role: 'DUKUH' as Role,
    label: 'Dukuh',
    judul: 'Masuk sebagai Dukuh',
    contoh: 'dukuh',
    catatan: 'Melihat seluruh data warga & infografis padukuhan.',
  },
  {
    role: 'RW' as Role,
    label: 'Ketua RW',
    judul: 'Masuk sebagai Ketua RW',
    contoh: 'rw019',
    catatan: 'Melihat seluruh data warga & infografis padukuhan.',
  },
  {
    role: 'RT' as Role,
    label: 'Ketua RT',
    judul: 'Masuk sebagai Ketua RT',
    contoh: 'rt001',
    catatan: 'Melihat seluruh data warga & infografis padukuhan.',
  },
] as const;

interface Props {
  dipilih: Role;
  onPilih: (role: Role) => void;
}

export function PilihanPeranLogin({ dipilih, onPilih }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<Role, HTMLButtonElement>>(new Map());
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  // Matikan transisi saat render pertama supaya indikator tidak terlihat
  // meluncur dari pojok kiri atas.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const btn = buttonRefs.current.get(dipilih);
    const container = containerRef.current;
    if (!btn || !container) return;

    const containerRect = container.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    setIndicator({
      left: btnRect.left - containerRect.left,
      width: btnRect.width,
    });

    // Nyalakan transisi setelah posisi awal terpasang.
    if (!ready) requestAnimationFrame(() => setReady(true));
  }, [dipilih, ready]);

  return (
    <div
      ref={containerRef}
      role="tablist"
      aria-label="Pilih peran"
      className="relative mt-4 grid grid-cols-4 rounded-xl bg-slate-100 p-1"
    >
      {/* Sliding indicator — kotak putih yang meluncur di belakang tombol. */}
      <span
        aria-hidden
        className={cn(
          'absolute inset-y-1 rounded-lg bg-surface shadow-sm',
          ready &&
            'duration-250 transition-all ease-[cubic-bezier(0.4,0,0.2,1)]',
        )}
        style={{ left: indicator.left, width: indicator.width }}
      />

      {PERAN_LOGIN.map((p) => (
        <button
          key={p.role}
          ref={(el) => {
            if (el) buttonRefs.current.set(p.role, el);
          }}
          type="button"
          role="tab"
          aria-selected={dipilih === p.role}
          onClick={() => onPilih(p.role)}
          className={cn(
            'focus-ring relative z-10 h-11 rounded-lg px-2 text-sm transition-colors duration-200',
            dipilih === p.role
              ? 'font-bold text-brand-700'
              : 'font-medium text-slate-500 hover:text-slate-700',
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
