/** Satu baris riwayat perubahan. */
export interface CatatanAudit {
  id: number;
  /** ISO datetime (UTC). */
  waktu: string;
  /** Username yang melakukan. */
  aktor: string;
  aksi: string;
  /** Nama warga atau username akun yang dikenai tindakan. */
  sasaran: string;
  sasaranId?: string | null;
  /** "kolom: lama -> baru", dipisah "; " kalau lebih dari satu. */
  perubahan?: string | null;
}
