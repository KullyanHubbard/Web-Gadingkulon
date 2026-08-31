import { useQuery } from '@tanstack/react-query';
import { periodeBulanIni } from '@/lib/tanggal';
import { statistikPublikApi } from '../api/statistik-publik-api';

export const statistikPublikKeys = {
  all: ['statistik-publik'] as const,
  /** Periode ikut kunci: dua bulan berbeda adalah dua jawaban berbeda. */
  periode: (periode?: string) =>
    ['statistik-publik', periode ?? 'kini'] as const,
};

export function useStatistikPublik(periode?: string) {
  // Bulan berjalan = keadaan hari ini, jawaban yang sama persis dengan
  // pemanggil tanpa periode (beranda, profil, infografis). Disamakan jadi satu
  // kunci di sini — kalau tidak, pindah dari beranda ke /statistik memuat ulang
  // data yang sudah ada di cache, lengkap dengan spinner-nya.
  //
  // Perbandingannya pakai jam browser sedangkan backend memakai WIB: kalau
  // keduanya berbeda bulan, yang terjadi cuma kembali ke dua kunci seperti
  // sebelumnya — bukan angka yang salah.
  const kunci = periode === periodeBulanIni() ? undefined : periode;

  return useQuery({
    queryKey: statistikPublikKeys.periode(kunci),
    queryFn: () => statistikPublikApi.get(kunci),
  });
}
