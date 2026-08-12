# Desain Autentikasi NIA — Warga PIN + Petugas Password

Tanggal: 2026-08-12

## Konteks

Aplikasi dipakai satu padukuhan (~350 KK, ~1.200 jiwa, 5 RT) sebagai proyek KKN.
Dua batasan menentukan seluruh desain:

1. **Nol biaya, tanpa toleransi.** Tidak boleh ada layanan berbayar, sekarang
   maupun nanti.
2. **Tidak ada developer yang standby setelah KKN.** Apa pun yang bisa rusak
   diam-diam akan rusak diam-diam, dan tidak ada yang memperbaikinya.

Populasi penggunanya: banyak lansia, awam teknologi, HP Android kelas bawah.
Data kependudukan sudah lengkap hasil import Excel — warga tidak mendaftarkan
NIK baru.

## Rancangan awal yang dibatalkan

Rancangan awal: warga registrasi mandiri dengan NIK + nomor HP + email, lalu
menerima token lewat WhatsApp/SMS atau email. Dibatalkan setelah diperiksa:

- **WhatsApp Cloud API tidak punya jatah gratis bulanan.** Sejak 1 Juli 2025
  Meta menagih per pesan terkirim. Template kategori *authentication* — yang
  wajib dipakai untuk OTP — di Indonesia ±Rp356,65/pesan + PPN 11%. Yang gratis
  di dalam *customer service window* hanya template *utility*; memakai kategori
  utility untuk mengirim OTP adalah pelanggaran kebijakan Meta. Ditambah syarat
  verifikasi bisnis dengan dokumen badan hukum dan nomor telepon khusus.
- **Gateway tidak resmi (Fonnte, Wablas) tetap berbayar**, melanggar ToS
  WhatsApp (risiko blokir permanen ditanggung pengguna), dan mensyaratkan satu
  HP dengan WhatsApp tetap online selamanya.
- **SMS OTP** Rp20–690/pesan lewat rute premium. Tidak ada tier gratis.
- **Email gratis** (Brevo ±300/hari, Resend 3.000/bulan) kuotanya cukup, tapi
  mayoritas lansia tidak bisa mengakses emailnya sendiri — banyak yang alamat
  Gmail-nya dibuatkan konter dan tidak pernah dibuka. Setiap token yang tidak
  sampai menjadi beban support yang tidak akan ada yang menangani.

Selain soal biaya, rancangan awal punya lubang keamanan: token dikirim ke
nomor/email yang **diketik pendaftar**, sehingga sistem hanya membuktikan
penguasaan nomor tersebut — bukan kepemilikan NIK. Siapa pun yang memegang
fotokopi KTP orang lain bisa mengklaim akunnya.

## Keputusan

1. **Login pertama warga: NIK + tanggal lahir → wajib menetapkan PIN 6 digit.**
   Keduanya sudah ada di data master, jadi tidak ada registrasi dan tidak ada
   aktivasi manual oleh pengurus. Login berikutnya: NIK + PIN.
2. **Nomor HP & email dikumpulkan lewat form opsional setelah masuk.** Keduanya
   adalah data yang ingin dikumpulkan padukuhan, bukan kunci masuk — dua
   kebutuhan berbeda yang sebelumnya tergabung menjadi satu alur.
3. **Warga melihat data dirinya + seluruh anggota Kartu Keluarganya.**
4. **Satu peran `ADMIN`** untuk Dukuh, RW, dan RT, tanpa cakupan wilayah.
5. **Lupa PIN → pengurus me-reset**, warga mengulang aktivasi. Tidak ada
   pemulihan mandiri, tidak ada OTP, tidak ada email, tidak ada WhatsApp.
6. **Tidak ada pemilih peran di layar masuk.** Halaman utama adalah form warga;
   pengurus lewat tautan kecil ke `/login/petugas`. Peran dibaca dari akun.
7. **NIK yang akunnya sudah aktif tidak bisa diklaim ulang** lewat tanggal
   lahir. Sekali aktif, satu-satunya jalan masuk adalah PIN atau reset oleh
   pengurus.

## Alur

1. **Aktivasi** (`/aktivasi`) — NIK + tanggal lahir → server verifikasi ke data
   master → tiket sekali pakai + nama pemilik NIK → warga mengonfirmasi namanya
   (menangkap salah ketik NIK sebelum PIN dibuat) → buat PIN → sesi aktif.
2. **Masuk warga** (`/login`) — NIK + PIN.
3. **Masuk pengurus** (`/login/petugas`) — username + password.
4. **Lengkapi kontak** (`/kontak`) — opsional, boleh dilewati.
5. **Reset PIN** — warga menemui pengurus membawa KTP → pengurus menekan Reset
   PIN pada data warga → akun kembali ke keadaan belum aktif.

## Batasan yang diterima sadar

- **Tanggal lahir bukan rahasia** bagi yang memegang Kartu Keluarga. Diterima
  karena warga bersifat baca-saja (tidak bisa mengubah atau menambah data) dan
  ancaman realistisnya tetangga penasaran, bukan penyerang serius. Tingkat
  keamanan disepadankan dengan taruhannya.
- **Celah klaim duluan:** untuk NIK yang belum pernah diaktifkan, orang lain
  bisa mengaktifkannya lebih dulu. Mitigasi: throttling di backend, log audit,
  dan reset oleh pengurus. Terdeteksi saat warga asli mengeluh tidak bisa masuk.
- **Tidak ada pemulihan mandiri.** Lupa PIN wajib lewat pengurus. Ini
  konsekuensi yang dipilih sengaja: satu-satunya alternatif adalah mesin
  pemulihan otomatis yang berbiaya, rapuh, dan tidak ada yang merawatnya.

## Yang wajib ditegakkan backend

Guard frontend hanya UX. FastAPI nanti wajib: menyimpan PIN & password sebagai
hash; **men-throttle endpoint cek aktivasi per NIK dan per IP** (ruang tanggal
lahir kecil — ini titik terlemah sistem); membuat tiket aktivasi sekali pakai
dan berumur pendek; mengunci login sementara setelah beberapa PIN salah;
menentukan otorisasi data dari klaim JWT dan bukan parameter request; membatasi
reset PIN hanya untuk ADMIN dan mencatatnya di log audit; serta menonaktifkan
akses otomatis dari status kependudukan (pindah/meninggal).

## Keputusan yang masih terbuka

Di luar cakupan implementasi ini, tapi harus dijawab sebelum sistem dipakai
sungguhan:

- Siapa pemilik akun hosting & database setelah KKN selesai (harus lembaga,
  bukan mahasiswa).
- Siapa pengendali data di bawah UU PDP 27/2022.
- Prosedur break-glass: siapa yang bisa mereset akun Dukuh.
  Jawaban sementara didokumentasikan di `docs/PROSEDUR-PENGURUS.md`.
