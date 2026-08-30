import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { QueryBoundary } from '@/components/ui/QueryBoundary';
import { Table, Td, Th } from '@/components/ui/Table';
import { PageHeader } from '@/components/layout/PageHeader';
import { BeritaFormDialog } from '@/features/berita/components/BeritaFormDialog';
import { FotoBerita } from '@/features/berita/components/BeritaCard';
import {
  useBeritaList,
  useHapusBerita,
} from '@/features/berita/hooks/use-berita';
import type { Berita } from '@/features/berita/types';
import { formatTanggal } from '@/features/berita/utils';
import { paths } from '@/routes/paths';

/**
 * CMS berita padukuhan: tulis, sunting, hapus.
 *
 * Dukuh saja (lihat `AppRoutes`). Bukan ADMIN: peran itu mengelola akun dan
 * sengaja tidak punya kewenangan atas isi portal — memberinya hak menerbitkan
 * berita mengaburkan pemisahan yang jadi dasar seluruh model peran ini.
 *
 * Berita disimpan di peramban, BUKAN di backend — lihat
 * `features/berita/api/berita-api.ts`. Peringatannya dipasang di layar supaya
 * penulisnya tidak mengira tulisannya sudah terbit untuk umum.
 */
export default function KelolaBeritaPage() {
  const { data, isLoading, isError } = useBeritaList();
  const hapus = useHapusBerita();
  const [target, setTarget] = useState<Berita | 'baru' | null>(null);

  const onHapus = (berita: Berita) => {
    if (
      window.confirm(
        `Hapus berita "${berita.judul}"? Tindakan ini tidak bisa dibatalkan.`,
      )
    ) {
      hapus.mutate(berita.id);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelola Berita"
        description="Tulis dan sunting kabar kegiatan padukuhan."
        action={<Button onClick={() => setTarget('baru')}>Tulis Berita</Button>}
      />

      <Alert tone="info">
        Berita masih disimpan di peramban ini saja — belum ada tabel berita di
        server. Tulisan tidak akan terlihat oleh pengunjung lain sampai
        penyimpanannya dipindahkan ke backend.
      </Alert>

      <Card>
        <QueryBoundary
          isLoading={isLoading}
          isError={isError}
          data={data}
          isEmpty={(d) => d.length === 0}
          loadingLabel="Memuat berita"
          errorMessage="Daftar berita belum bisa ditampilkan."
          emptyTitle="Belum ada berita"
          emptyDescription="Mulai dengan menekan Tulis Berita."
        >
          {(daftar) => (
            <Table>
              <thead>
                <tr>
                  <Th>Berita</Th>
                  <Th>Tanggal Terbit</Th>
                  <Th>Penulis</Th>
                  <Th className="text-right">Aksi</Th>
                </tr>
              </thead>
              <tbody>
                {daftar.map((berita) => (
                  <tr key={berita.id}>
                    <Td className="whitespace-normal">
                      <div className="flex items-center gap-3">
                        <FotoBerita
                          berita={berita}
                          className="h-12 w-16 shrink-0 rounded-md"
                        />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900">
                            {berita.judul}
                          </p>
                          <Link
                            to={paths.beritaDetail(berita.slug)}
                            className="text-xs text-brand-700 hover:underline"
                          >
                            /berita/{berita.slug}
                          </Link>
                        </div>
                      </div>
                    </Td>
                    <Td>{formatTanggal(berita.tanggalTerbit)}</Td>
                    <Td>{berita.penulis}</Td>
                    <Td className="text-right">
                      <div className="inline-flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setTarget(berita)}
                        >
                          Sunting
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => onHapus(berita)}
                          isLoading={
                            hapus.isPending && hapus.variables === berita.id
                          }
                        >
                          Hapus
                        </Button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </QueryBoundary>
      </Card>

      <BeritaFormDialog target={target} onClose={() => setTarget(null)} />
    </div>
  );
}
