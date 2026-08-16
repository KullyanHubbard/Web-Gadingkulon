# Prosedur Pengurus — SIDUK, Portal Data Kependudukan

Dokumen ini untuk **pengurus padukuhan** (Dukuh, RW, RT), bukan untuk
programmer. **Simpan salinan cetaknya di rumah Dukuh.**

---

## Kenapa dokumen ini penting

Aplikasi ini sengaja dibuat tanpa mekanisme otomatis apa pun untuk mencabut
akses. **Akun pengurus tidak punya masa berlaku.** Akun yang dibuat hari ini
akan tetap bisa dipakai bertahun-tahun ke depan sampai ada orang yang
menonaktifkannya secara manual.

Artinya: prosedur di dokumen ini **bukan anjuran, tapi satu-satunya pengaman
yang dimiliki sistem.** Kalau seorang Ketua RT berhenti menjabat dan tidak ada
yang menonaktifkan akunnya, ia tetap bisa masuk dan tetap bisa mengubah data
warga. Tidak ada apa pun di dalam aplikasi yang akan menghentikannya sendiri.

Ini pilihan yang diambil sadar. Mekanisme otomatis yang tidak ada yang merawat
justru akan mengunci semua orang di luar sistem pada suatu hari tanpa ada yang
bisa membuka. Yang menggantikannya adalah dokumen ini, dan kedisiplinan
menjalankannya.

---

## Tiga tingkat akun

| Tingkat      | Siapa                        | Bisa apa                                                      |
| ------------ | ---------------------------- | ------------------------------------------------------------- |
| **Warga**    | seluruh warga padukuhan      | melihat data dirinya & Kartu Keluarganya                       |
| **Pengurus** | Dukuh, Ketua RW, Ketua RT    | melihat semua data warga & infografis; menambah, mengubah, menghapus data warga **di wilayahnya**; reset PIN warga |
| **Admin**    | yang memelihara aplikasi     | semua yang bisa Pengurus, **ditambah** membuat & menonaktifkan akun pengurus |

**Pengurus tidak bisa membuat atau menonaktifkan akun pengurus mana pun,
termasuk akunnya sendiri.** Itu hanya bisa dilakukan Admin. Ini disengaja:
orang yang bisa dicabut haknya tidak boleh memegang tombol pencabutannya.

**Admin bukan jabatan di padukuhan.** Dukuh, Ketua RW, dan Ketua RT semuanya
masuk tingkat **Pengurus**, bukan Admin. Admin adalah orang yang mengurus
aplikasinya secara teknis — saat ini pembuat aplikasi (tim KKN), setelah masa
KKN dialihkan ke siapa pun yang melanjutkan memeliharanya. Cara mengalihkannya
ada di bagian [Mengalihkan akun Admin](#mengalihkan-akun-admin).

---

## Batas wilayah pengurus

Pengurus hanya bisa **mengubah** data warga di wilayah kerjanya:

| Jabatan      | Bisa mengubah data warga     |
| ------------ | ---------------------------- |
| Dukuh        | seluruh padukuhan            |
| Ketua RW     | seluruh RT di dalam RW-nya   |
| Ketua RT     | RT-nya sendiri saja          |

**Melihat** data tidak dibatasi — semua pengurus bisa melihat seluruh data
padukuhan dan seluruh infografis. Yang dibatasi hanya menyimpan perubahan.

Kalau Anda mencoba mengubah data warga di luar wilayah Anda, aplikasi menolak
dan menampilkan pesan. Itu bukan kerusakan — batas ini ada supaya salah klik
pada baris yang salah tidak berakibat apa-apa.

---

## Bagaimana warga masuk ke aplikasi

Warga **tidak perlu mendaftar**. Semua NIK sudah ada di dalam sistem.

**Pertama kali:**

1. Buka halaman masuk, klik **"Aktifkan akun Anda"**.
2. Masukkan NIK (16 angka di KTP) dan tanggal lahir.
3. Layar menampilkan nama pemiliknya. Kalau namanya salah, berarti NIK-nya
   salah ketik — ulangi.
4. Buat **PIN 6 angka**. Ini yang dipakai seterusnya.

**Selanjutnya:** cukup NIK + PIN.

> Tidak ada SMS, tidak ada WhatsApp, tidak ada email. Aplikasi ini sengaja
> dibuat tanpa itu semua supaya tidak ada biaya bulanan dan tidak ada yang
> bisa mati diam-diam.

---

## Warga lupa PIN

**Ini satu-satunya cara memulihkan akun. Tidak ada cara lain.**

Semua pengurus bisa melakukan ini untuk warga di wilayahnya — warga tidak perlu
mencari Dukuh atau pemelihara aplikasi.

1. Warga **datang langsung** menemui pengurus, **membawa KTP**.
2. Pastikan Anda mengenali orangnya. Cocokkan wajah dengan KTP.
3. Pengurus masuk ke aplikasi → menu **Data Penduduk** → cari namanya → klik
   **Reset PIN**.
4. Sampaikan ke warga: buka halaman masuk → **Aktifkan akun Anda** → masukkan
   NIK dan tanggal lahir → buat PIN baru.

**JANGAN mereset PIN atas permintaan lewat telepon, SMS, atau WhatsApp.**
Verifikasi tatap muka adalah satu-satunya pengaman yang dimiliki sistem ini.
Kalau itu dilanggar, tidak ada lapisan pengaman lain di belakangnya.

---

## Warga bilang "akun saya sudah aktif padahal saya belum pernah pakai"

Kemungkinan ada orang lain yang mengaktifkan NIK tersebut lebih dulu — biasanya
anggota keluarga yang membantu, kadang orang lain.

1. Tanyakan dulu ke anggota keluarganya, sering kali anaknya yang membantu.
2. Kalau memang bukan keluarganya, lakukan **Reset PIN** seperti di atas, lalu
   dampingi warga membuat PIN baru saat itu juga.
3. Laporkan ke Dukuh bila terjadi lebih dari sekali pada orang berbeda.

---

## Mengubah data warga

Menambah, mengubah, dan menandai warga pindah atau meninggal dilakukan lewat
menu **Data Penduduk**, memakai formulir biasa di dalam aplikasi.

**Yang perlu diingat:**

- Setiap perubahan **tercatat**: siapa yang mengubah, kapan, dan apa yang
  berubah. Ini bukan pengawasan terhadap pengurus — ini supaya kalau ada data
  yang keliru, bisa ditelusuri kembali dan diperbaiki, bukan ditebak.
- **Warga pindah atau meninggal:** ubah **status kependudukannya**, jangan
  dihapus. Datanya tetap tersimpan, aksesnya ke aplikasi tertutup dengan
  sendirinya.
- **Salah input** (misalnya baris ganda hasil import): baru gunakan **Hapus**.
- **NIK tidak bisa diubah lewat formulir biasa.** NIK adalah kunci masuk warga
  ke aplikasi — kalau diubah, akun warga ikut putus. Kalau ada NIK yang salah,
  laporkan ke Dukuh, dan Dukuh menghubungi pemegang akun Admin.

---

## Pengurus berganti jabatan

**Setiap pengurus punya akun sendiri. Jangan pernah berbagi satu akun bersama.**
Kalau akun dipakai bergantian, tidak ada yang bisa tahu siapa melakukan apa.

### Siapa melapor kepada siapa

| Yang berganti | Wajib melapor kepada | Siapa yang melapor                    |
| ------------- | -------------------- | ------------------------------------- |
| Ketua RT      | Ketua RW-nya, lalu Dukuh | Ketua RT yang lama; kalau ia berhalangan, Ketua RW |
| Ketua RW      | Dukuh                | Ketua RW yang lama; kalau ia berhalangan, Dukuh sendiri mencatat |
| Dukuh         | Pemegang akun Admin  | Dukuh yang lama; kalau ia berhalangan, Ketua RW paling senior |

**Dukuh adalah pihak yang wajib memastikan laporan ini sampai**, bukan sekadar
menerimanya. Kalau Dukuh mendengar ada pergantian pengurus dari sumber mana pun
— rapat, obrolan, surat — itu sudah cukup untuk memulai langkah di bawah, tanpa
menunggu laporan resmi.

### Berapa lama akun lama boleh tetap aktif

**Paling lama 7 hari sejak pergantian berlaku.** Kalau pergantiannya sudah
diketahui sebelumnya (masa jabatan habis, pengunduran diri terencana), akun
baru dibuat lebih dulu dan akun lama dinonaktifkan **pada hari pergantian**.

Batas 7 hari ini bukan target, tapi batas atas. Selama akun lama masih aktif,
orang yang sudah tidak menjabat masih bisa mengubah data warga.

Kalau pergantiannya karena **konflik, pemberhentian, atau kehilangan
kepercayaan**: nonaktifkan **hari itu juga**, sebelum akun penggantinya
sempat dibuat. Urutannya sengaja dibalik untuk kasus ini.

### Langkah konkret

Dilakukan oleh **pemegang akun Admin**, atas permintaan Dukuh:

1. **Buat akun baru** untuk pengurus pengganti:
   menu **Akun Pengurus** → **Tambah** → isi nama, jabatan, dan wilayah
   (RW dan RT sesuai jabatannya).
2. **Serahkan password awal** kepada pengurus baru secara **tatap muka**, dan
   dampingi ia masuk sekali untuk memastikan akunnya bisa dipakai.
3. **Nonaktifkan akun lama:** menu **Akun Pengurus** → cari namanya → **Nonaktifkan**.
   Akun tidak dihapus, hanya dimatikan — riwayat perubahan yang pernah ia
   lakukan tetap tersimpan dan tetap bisa ditelusuri.
4. **Catat pergantiannya** di buku administrasi padukuhan: tanggal, nama lama,
   nama baru, dan siapa yang melakukan langkah 1–3.

> Langkah 2 harus terbukti berhasil sebelum langkah 3 dijalankan — kecuali
> untuk kasus konflik di atas, di mana langkah 3 didahulukan.

---

## Pemeriksaan berkala oleh Dukuh

**Setiap 3 bulan**, dan **wajib** setiap kali ada pergantian pengurus di tingkat
mana pun, Dukuh melakukan pemeriksaan berikut. Ini satu-satunya cara mengetahui
ada akun yang tertinggal aktif.

1. Minta pemegang akun Admin membuka menu **Akun Pengurus** dan mencetak atau
   memfoto **daftar akun yang statusnya aktif**.
2. Bandingkan baris per baris dengan **daftar pengurus yang benar-benar sedang
   menjabat**, sesuai buku administrasi padukuhan.
3. Untuk setiap baris, jawab dua pertanyaan:
   - Apakah orang ini masih menjabat? Kalau tidak → **nonaktifkan hari itu juga.**
   - Apakah wilayahnya (RW/RT) masih sesuai jabatannya sekarang? Kalau tidak →
     minta Admin membetulkannya.
4. Periksa juga arah sebaliknya: adakah pengurus yang menjabat tapi **tidak
   punya akun**? Kalau ada, itu tandanya ada pergantian yang tidak pernah
   dilaporkan — telusuri kapan terjadinya.
5. **Tulis hasil pemeriksaan di buku administrasi**, walaupun hasilnya "semua
   sesuai". Catatan bahwa pemeriksaan pernah dilakukan sama pentingnya dengan
   hasilnya — tanpa itu, tidak ada yang tahu pemeriksaan terakhir kapan.

| Tanggal periksa | Jumlah akun aktif | Sesuai? | Tindakan | Diperiksa oleh |
| --------------- | ----------------- | ------- | -------- | -------------- |
|                 |                   |         |          |                |
|                 |                   |         |          |                |

---

## Kalau pemegang akun Admin tidak bisa dihubungi

Ini keadaan yang harus punya jawaban **sebelum** terjadi. Tanpa Admin, tidak ada
yang bisa membuat akun pengurus baru maupun menonaktifkan akun lama — pengurus
yang sudah berhenti akan tetap bisa masuk, dan pengurus baru tidak bisa
diberi akun.

**Langkah yang bisa dilakukan sekarang:**

1. Hubungi pemegang akun Admin lewat semua jalur yang tercatat di bagian
   [Akun layanan](#akun-layanan-untuk-yang-mengurus-teknis) di bawah, termasuk
   kontak cadangannya.
2. Kalau dalam **14 hari** tidak ada tanggapan, Dukuh menyatakan keadaan ini
   secara tertulis di buku administrasi, dengan tanggal dan daftar upaya
   kontak yang sudah dilakukan.
3. Sementara belum ada Admin: **jangan berbagi akun pengurus yang ada** sebagai
   jalan pintas. Pengurus baru yang belum punya akun bekerja lewat pengurus
   lain yang masih menjabat sampai Admin tersedia kembali. Catat setiap kali
   ini terjadi.

**Sudah diputuskan (16 Agustus 2026):** peran Admin akan diteruskan ke
**pengurus dari kelurahan** yang bersedia memelihara aplikasi setelah masa KKN
selesai. Password akun Admin dicatat pemegangnya supaya tidak terlupa.

**Yang belum tertutup:** mencatat password mencegah *lupa*, tapi belum
mencegah *hilang*. Kalau catatannya ikut hilang, atau pemegangnya tidak bisa
dihubungi sebelum sempat menyerahkan, tidak ada seorang pun yang bisa membuat
atau menonaktifkan akun pengurus lewat aplikasi.

> **Saran untuk menutupnya sekarang, bukan nanti:** buatkan akun Admin untuk
> pengurus kelurahan tersebut **sejak sekarang**, jangan menunggu hari serah
> terima. Dua akun Admin yang hidup bersamaan saling jadi cadangan — kalau yang
> satu hilang, yang lain masih bisa membuat penggantinya.
>
> Kalau saran ini tidak diambil, isi bagian ini:
> - Catatan password Admin disimpan di: ............................................
> - Selain pemegangnya, yang tahu tempat itu: _(nama & jabatan)_ ............................................

---

## Hal-hal yang sudah diputuskan (16 Agustus 2026)

- **Warga yang meninggal atau pindah tetap dihitung** dalam "total penduduk"
  yang tampil di halaman depan aplikasi. Angka itu berarti *jumlah warga yang
  tercatat*, bukan jumlah yang saat ini tinggal.
  Ini keputusan **sementara** — perlu ditinjau lagi kalau nanti jumlah warga
  meninggal sudah banyak, karena angkanya jadi makin jauh dari kenyataan.
  Baris yang dihapus karena **salah input** tidak pernah ikut dihitung.

- **Nomor Kartu Keluarga diambil dari desa dan perangkat desa.** Selama
  aplikasi masih tahap uji coba, nomor KK untuk keluarga baru dibuat sementara
  oleh sistem, dan diganti nomor asli begitu datanya diserahkan desa.
  Selama masa uji coba, **jangan menganggap nomor KK di aplikasi sebagai nomor
  resmi.**

- **Penanggung jawab data warga: Bapak Lurah dan Bapak Dukuh.**
  Artinya: warga yang keberatan atau minta datanya dibetulkan mengadu ke
  Dukuh; kalau belum selesai, naik ke Lurah. Kalau ada masalah kebocoran data,
  Lurah yang berkewajiban melapor.
  Pemegang akun Admin **tidak** bertanggung jawab atas isi datanya — ia hanya
  memelihara aplikasinya.

---

## Akun layanan (untuk yang mengurus teknis)

Aplikasi ini berjalan di komputer sewaan (server) yang didaftarkan memakai
sebuah **alamat email**. Email itulah yang memegang kendali: yang bisa
memperpanjang sewa, membayar, memperbaiki, atau memindahkan aplikasi.

**Kalau email itu milik pribadi seseorang yang kemudian tidak bisa dihubungi,
aplikasi ini tidak bisa diselamatkan siapa pun.** Karena itu email dan akun di
bawah ini harus milik lembaga padukuhan atau desa, bukan pribadi mahasiswa,
dan password-nya harus diketahui lebih dari satu orang.

**Sudah diputuskan (16 Agustus 2026):** dipakai **email khusus yang dibuat
untuk desa**, bukan email pribadi yang juga dipakai untuk keperluan lain.

Isi daftar berikut sebelum serah terima:

- Alamat email khusus desa tersebut: ....................................
- **Siapa dari pihak desa yang tahu password email itu:** ....................................
- Akun hosting web: ....................................
- Akun database: ....................................
- Pemegang akun Admin aplikasi saat ini: ....................................
- Kontak pemegang akun Admin (dua jalur berbeda): ....................................
- Penanggung jawab dari pihak padukuhan: ....................................

Dua hal yang sering terlewat dan membuat penyerahan cuma di atas kertas:

1. **Password email khusus itu harus diketahui minimal satu orang pihak desa.**
   Kalau cuma pembuatnya yang tahu, statusnya sama saja dengan email pribadi.
2. **Nomor HP dan email pemulihan** pada akun tersebut jangan menunjuk ke nomor
   atau email pribadi pembuatnya. Kalau menunjuk ke sana, siapa pun yang
   memegang nomor itu tetap bisa mengambil alih akunnya kapan saja.

**Email lembaga yang password-nya cuma diketahui satu orang punya masalah yang
sama persis dengan email pribadi.** Pastikan minimal dua orang bisa membukanya,
dan catat siapa saja.

---

## Mengalihkan akun Admin

Dilakukan **sebelum** pemegang Admin yang sekarang berhenti terlibat — bukan
sesudahnya.

Peran Admin berpindah lewat **pembuatan akun baru, bukan penyerahan password.**
Password akun lama tidak pernah diberikan ke penggantinya: kalau dua orang
memakai akun yang sama, catatan perubahan tidak bisa lagi membedakan siapa
melakukan apa — justru pada peran yang paling perlu bisa dibedakan.

1. Padukuhan menentukan siapa pemelihara berikutnya, dicatat di buku
   administrasi.
2. Admin yang menjabat membuat **akun Admin baru** untuk orang tersebut.
3. Pemelihara baru masuk, **mengganti passwordnya sendiri**, dan memastikan ia
   bisa membuka menu **Akun Pengurus**.
4. **Setelah langkah 3 terbukti berhasil**, akun Admin lama dinonaktifkan.
5. Perbarui bagian [Akun layanan](#akun-layanan-untuk-yang-mengurus-teknis) di
   atas, termasuk kontaknya.

> **Urutan langkah 3 sebelum 4 tidak boleh dibalik.** Menonaktifkan akun lama
> sebelum akun baru terbukti bisa dipakai adalah cara paling umum sebuah sistem
> menjadi tidak bisa dikelola siapa pun.
