/**
 * NIK terakhir yang dipakai masuk, untuk mengisi awal kolom NIK di kunjungan
 * berikutnya ("Ingat saya").
 *
 * Yang disimpan HANYA NIK — tidak pernah PIN. NIK sendiri bukan kunci masuk:
 * tanpa PIN ia tidak membuka apa pun, dan angka itu sudah tercetak di KTP yang
 * dibawa pemiliknya. PIN yang tersimpan justru sebaliknya — satu perangkat
 * pinjaman langsung jadi akses penuh.
 */

const KUNCI = 'nia.nik-diingat';

export function getNikDiingat(): string {
  try {
    return localStorage.getItem(KUNCI) ?? '';
  } catch {
    // Safari mode privat melempar saat storage disentuh; lupa NIK bukan alasan
    // untuk menggagalkan halaman masuk.
    return '';
  }
}

export function simpanNikDiingat(nik: string | null): void {
  try {
    if (nik) localStorage.setItem(KUNCI, nik);
    else localStorage.removeItem(KUNCI);
  } catch {
    /* sama seperti di atas — diabaikan dengan sengaja */
  }
}
