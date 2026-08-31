import { useState } from 'react';
import { Button } from '@/components/ui/Button';

/**
 * Batas ukuran foto utama.
 *
 * Bukan sekadar sopan santun: berita disimpan di `localStorage` yang kuotanya
 * ±5 MB per domain, dan data URL membengkak ±33% dari berkas aslinya. Satu foto
 * kamera ponsel 4 MB sudah cukup untuk membuat penyimpanan gagal DIAM-DIAM,
 * yang artinya berita hilang tanpa pesan.
 */
const MAKS_FOTO_BYTE = 600_000;

const MAKS_FOTO_KB = Math.round(MAKS_FOTO_BYTE / 1000);

/** Berkas gambar -> data URL, supaya bisa ikut masuk `localStorage`. */
function bacaSebagaiDataUrl(berkas: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const pembaca = new FileReader();
    pembaca.onload = () => resolve(String(pembaca.result));
    pembaca.onerror = () => reject(new Error('Foto gagal dibaca.'));
    pembaca.readAsDataURL(berkas);
  });
}

interface FotoBeritaFieldProps {
  /** Data URL foto saat ini, atau `''` kalau belum ada. */
  value: string;
  onChange: (dataUrl: string) => void;
}

/** Pemilih foto utama berita, lengkap dengan pratinjau & batas ukuran. */
export function FotoBeritaField({ value, onChange }: FotoBeritaFieldProps) {
  const [error, setError] = useState<string | null>(null);

  const onPilih = async (berkas: File | undefined) => {
    if (!berkas) return;
    if (berkas.size > MAKS_FOTO_BYTE) {
      setError(
        `Foto terlalu besar (maksimal ${MAKS_FOTO_KB} KB). Perkecil dulu sebelum diunggah.`,
      );
      return;
    }
    setError(null);
    onChange(await bacaSebagaiDataUrl(berkas));
  };

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        Foto Utama
      </label>
      {value && (
        <div className="mb-2 flex items-center gap-3">
          <img
            src={value}
            alt="Pratinjau foto utama"
            className="h-20 w-32 rounded-lg object-cover"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onChange('')}
          >
            Hapus foto
          </Button>
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        onChange={(e) => void onPilih(e.target.files?.[0])}
        className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-600/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-600/20 dark:file:text-brand-300"
      />
      {error ? (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      ) : (
        <p className="mt-1 text-xs text-slate-500">
          Opsional. JPG/PNG, maksimal {MAKS_FOTO_KB} KB.
        </p>
      )}
    </div>
  );
}
