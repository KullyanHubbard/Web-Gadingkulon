import { Link } from 'react-router-dom';
import { Alert } from '@/components/ui/Alert';
import { paths } from '@/routes/paths';

/** Ajakan melengkapi kontak. Tampilan saja — lihat `KontakPrompt`. */
export function KontakPromptView() {
  return (
    <div className="mb-6">
      <Alert tone="info">
        Nomor HP dan email Anda belum terisi.{' '}
        <Link
          to={paths.kontak}
          className="font-medium underline underline-offset-2"
        >
          Lengkapi kontak
        </Link>{' '}
        agar pengurus padukuhan bisa menghubungi Anda. Boleh dilewati.
      </Alert>
    </div>
  );
}
