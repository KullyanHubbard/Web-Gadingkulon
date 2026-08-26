import { cn } from '@/lib/utils';
import type { Role } from '../types';

/**
 * Empat peran di halaman masuk, beserta contoh username tiap peran.
 *
 * Pilihan ini **tidak dikirim ke backend dan tidak menentukan apa pun.** Peran
 * seseorang sudah melekat pada akunnya; memaksakannya cocok dengan pilihan di
 * layar tidak menambah keamanan sedikit pun, dan justru memberi tahu penebak
 * password peran apa yang dipegang sebuah username. Gunanya orientasi: orang
 * tahu ia berada di tempat yang benar, dan melihat bentuk username yang
 * diharapkan.
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
    label: 'Pak Dukuh',
    judul: 'Masuk sebagai Pak Dukuh',
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

export type PeranLogin = (typeof PERAN_LOGIN)[number];

interface Props {
  dipilih: Role;
  onPilih: (role: Role) => void;
}

export function PilihanPeranLogin({ dipilih, onPilih }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Pilih peran"
      className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4"
    >
      {PERAN_LOGIN.map((p) => (
        <button
          key={p.role}
          type="button"
          role="tab"
          aria-selected={dipilih === p.role}
          onClick={() => onPilih(p.role)}
          className={cn(
            'focus-ring rounded-lg border-1 px-2 py-2 text-sm font-medium transition-colors',
            dipilih === p.role
              ? 'border-brand-600 bg-brand-50 text-brand-800'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50',
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
