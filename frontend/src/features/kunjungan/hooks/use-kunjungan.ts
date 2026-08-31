import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { kunjunganApi } from '../api/kunjungan-api';

const KUNCI = 'siduk.kunjunganTerhitung';

function hariIni(): string {
  // Tanggal LOKAL, bukan `toISOString()` yang UTC: backend memakai
  // `date.today()` (jam server, WIB), jadi pukul 00:00-07:00 WIB kunci ini
  // masih menunjuk tanggal kemarin — kunjungan pertama pagi hari tidak
  // pernah terhitung. `sv-SE` kebetulan satu-satunya locale yang memformat
  // YYYY-MM-DD apa adanya.
  return new Date().toLocaleDateString('sv-SE');
}

function sudahDihitungHariIni(): boolean {
  return localStorage.getItem(KUNCI) === hariIni();
}

const kunciQuery = () => ['kunjungan', hariIni()] as const;

/**
 * Kunjungan hari ini ke portal publik, ditambah SEKALI per browser per hari.
 *
 * Satu `useQuery` ber-key sebagai SATU-SATUNYA sumber tampilan — bukan
 * `useMutation` lokal. Alasannya: `StrictMode` (dev) menjalankan efek dua kali
 * (setup-cleanup-setup), dan observer mutation yang menerima hasil sukses
 * ternyata bisa BUKAN observer yang sedang dibaca instance komponen aktif —
 * datanya benar ada di cache, tapi komponennya tidak pernah diberi tahu.
 * Query yang di-key dibagikan lewat cache global: `setQueryData` memberi tahu
 * SIAPA PUN yang membaca key ini saat itu, jadi kebal dari observer mana yang
 * "asli".
 *
 * ponytail: penghitung per-BROWSER (dijaga `localStorage`), bukan pengunjung
 * unik — lihat `app/data/kunjungan.py` di backend untuk alasannya. Cukup untuk
 * angka hiasan di footer.
 */
export function useKunjunganHariIni(): number | undefined {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: kunciQuery(),
    queryFn: () => kunjunganApi.lihat(),
  });

  // Dijaga `ref`: dua setup sintetis `StrictMode` berjalan sebelum promise
  // pertama sempat menulis `localStorage`, jadi `sudahDihitungHariIni()` saja
  // belum cukup untuk mencegah dua panggilan tambah() dalam jendela itu.
  const dipicu = useRef(false);
  useEffect(() => {
    if (dipicu.current || sudahDihitungHariIni()) return;
    dipicu.current = true;
    kunjunganApi.tambah().then((jumlah) => {
      localStorage.setItem(KUNCI, hariIni());
      queryClient.setQueryData(kunciQuery(), jumlah);
    });
  }, [queryClient]);

  return query.data;
}
