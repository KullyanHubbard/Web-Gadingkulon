import { forwardRef, useState, type ComponentProps } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from './Input';

type PasswordInputProps = Omit<
  ComponentProps<typeof Input>,
  'type' | 'trailing'
>;

/**
 * Kolom rahasia (PIN / password) dengan tombol lihat-sembunyikan.
 *
 * Dipakai empat kali (masuk warga, masuk pengurus, dua kolom PIN di aktivasi),
 * jadi keadaan "sedang terlihat" hidup di sini — bukan diulang di tiap form.
 *
 * Tombolnya `tabIndex={-1}`: pengguna keyboard menekan Tab dari kolom PIN untuk
 * sampai ke tombol Masuk, bukan untuk singgah di sakelar tampilan. Tetap bisa
 * dijangkau dengan klik, dan `aria-label`-nya menyatakan keadaan sekarang.
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (props, ref) => {
    const [terlihat, setTerlihat] = useState(false);
    const Ikon = terlihat ? EyeOff : Eye;

    return (
      <Input
        ref={ref}
        type={terlihat ? 'text' : 'password'}
        trailing={
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setTerlihat((v) => !v)}
            aria-label={terlihat ? 'Sembunyikan' : 'Tampilkan'}
            className="focus-ring rounded p-1 text-slate-400 transition-colors hover:text-slate-600"
          >
            <Ikon className="h-4 w-4" />
          </button>
        }
        {...props}
      />
    );
  },
);
PasswordInput.displayName = 'PasswordInput';
