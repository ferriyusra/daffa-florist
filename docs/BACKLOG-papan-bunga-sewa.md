# Backlog — Sistem Sewa Papan Bunga

**Sumber:** [PRD-papan-bunga-sewa.md](PRD-papan-bunga-sewa.md) · [ERD-papan-bunga-sewa.md](ERD-papan-bunga-sewa.md)
**Tanggal:** 3 Juni 2026
**Status:** Siap dikerjakan

Backlog ini menerjemahkan PRD menjadi **Epic → Story → Task kecil**. Tiap story punya kriteria penerimaan (AC) dan task yang dapat diselesaikan & di-review terpisah. Penomoran milestone mengikuti §11 PRD.

**Estimasi ukuran:** `XS` (<2j) · `S` (½ hari) · `M` (1 hari) · `L` (2+ hari)
**Legenda task:** `[ ]` belum · `[~]` berjalan · `[x]` selesai

**Kondisi awal codebase (baseline):**
- tRPC router yang ada: `auth`, `product`, `order` ([src/server/api/root.ts](../src/server/api/root.ts)). Belum ada router rental/admin.
- `OrderStatus` lama: `PENDING/CONFIRMED/PROCESSING/SHIPPED/DELIVERED/CANCELLED` ([prisma/schema.prisma](../prisma/schema.prisma)). Belum ada field sewa.
- Halaman admin di [src/app/admin/](../src/app/admin/) masih UI statis, belum terhubung API.

---

## Ringkasan Epic

| Epic | Milestone | Story | Fokus |
|------|-----------|-------|-------|
| E0 — Fondasi Teknikal (Auth & CRUD) | M0 | S0.1–S0.9 | Auth (register/login/logout/sesi/role) & CRUD seluruh halaman admin |
| E1 — Fondasi Data & Skema | M1 | S1.1–S1.3 | Migrasi Prisma, enum status, model unit |
| E2 — Ketersediaan & Pemesanan | M2 | S2.1–S2.6 | Date picker, cek ketersediaan, createRental transaksional, checkout DP |
| E3 — Admin Operasional | M3 | S3.1–S3.5 | Kalender pesanan, update status, jadwal pasang/pickup, unit |
| E4 — Penyempurnaan Bisnis | M4 | S4.1–S4.4 | Deposit, pembatalan, zona ongkir, ekspres duka cita |
| E5 — Otomasi (Future) | M5 | S5.1–S5.4 | Payment gateway, integrasi kurir, notifikasi WA/email, analitik |

---

## E0 — Fondasi Teknikal: Auth & CRUD Admin (M0)

> Output: autentikasi penuh (register/login/logout/sesi/role) terverifikasi & semua halaman admin terhubung CRUD ke API. Menjadi prasyarat E2 (jalur pelanggan butuh sesi) & E3 (admin butuh `adminProcedure`).
>
> **Catatan baseline:** sebagian auth sudah ada di code (NextAuth Credentials, `auth.register`, halaman `/login` & `/register`) dan halaman admin sudah ada sebagai **UI statis** ([admin/products](../src/app/admin/products/), [gallery](../src/app/admin/gallery/), [promos](../src/app/admin/promos/), [customers](../src/app/admin/customers/), [delivery-areas](../src/app/admin/delivery-areas/)). Story berikut ditulis lengkap (end-to-end); bila bagian sudah ada, task tetap mencakup **verifikasi + uji + tutup celah**, bukan menulis ulang.

### Auth

#### S0.1 — Registrasi pengguna
**Sebagai** pengunjung, **agar** bisa membuat akun untuk memesan.
**AC:** Form register (nama, email, no HP, password) → `auth.register` membuat `User` dengan password ter-hash (bcrypt), role default `CUSTOMER`; email duplikat ditolak dengan pesan jelas; sukses → auto-login atau arahkan ke `/login`.

- [ ] `XS` Verifikasi/lengkapi `auth.register` ([routers/auth.ts](../src/server/api/routers/auth.ts)) — validasi zod (email, panjang password), cek email unik, hash bcrypt.
- [ ] `S` Form register ([register/page.tsx](../src/app/register/page.tsx)) — validasi client, tampilkan error server, state loading.
- [ ] `XS` Setelah sukses: auto sign-in atau redirect `/login` dengan notifikasi.

#### S0.2 — Login (kredensial) & sesi
**Sebagai** pengguna terdaftar, **agar** masuk dan sesinya tersimpan.
**AC:** Login email+password via NextAuth Credentials; gagal → pesan generik (tanpa bocorkan field mana yang salah); sukses → sesi JWT memuat `id` & `role`; redirect ke tujuan/`/dashboard`.

- [ ] `XS` Verifikasi konfigurasi NextAuth Credentials ([server/auth/config.ts](../src/server/auth/config.ts)) — verifikasi bcrypt, callback `jwt`/`session` menambar `id`+`role`.
- [ ] `S` Form login ([login/page.tsx](../src/app/login/page.tsx)) — `signIn('credentials')`, error handling, loading.
- [ ] `XS` Verifikasi `useSession` wrapper ([use-auth.ts](../src/hooks/use-auth.ts)) mengembalikan `{ user, isLoading, logout }`.

#### S0.3 — Logout
**Sebagai** pengguna, **agar** keluar dengan aman.
**AC:** Aksi logout memanggil `signOut`, membersihkan sesi, redirect ke beranda/`/login`; tombol tersedia di navbar (saat login) & dashboard.

- [ ] `XS` Implement aksi logout via `signOut` di [use-auth.ts](../src/hooks/use-auth.ts).
- [ ] `XS` Tombol logout di navbar/dashboard (tampil kondisional saat ada sesi).

#### S0.4 — Role, proteksi route & guard server
**Sebagai** sistem, **agar** hanya peran berwenang mengakses area tertentu.
**AC:** `protectedProcedure` (butuh sesi) & `adminProcedure` (role `ADMIN`) tersedia; route `/dashboard/*` butuh login; route `/admin/*` butuh role `ADMIN` (redirect bila tidak); akses langsung URL admin oleh non-admin ditolak.

- [ ] `S` Verifikasi/lengkapi `protectedProcedure` & `adminProcedure` di [trpc.ts](../src/server/api/trpc.ts) (UNAUTHORIZED/FORBIDDEN). *(menggantikan task guard di S3.1.)*
- [ ] `S` Proteksi server-side `/admin/*` (cek role di [admin/layout.tsx](../src/app/admin/layout.tsx) atau middleware) + `/dashboard/*` butuh sesi.
- [ ] `XS` Sembunyikan tautan admin dari UI untuk non-admin.

### CRUD Admin

> Pola umum tiap entitas: router tRPC `list/getById/create/update/delete` (mutasi pakai `adminProcedure`), validasi zod, lalu hubungkan halaman admin yang kini statis ke data nyata (tabel + form + konfirmasi hapus). Patuhi anti-pattern [MASTER.md](../design-system/daffa-florist/MASTER.md) (tanpa emoji, lucide-react, `cursor-pointer`, transisi 150–300ms).

#### S0.5 — CRUD Produk & katalog
**AC:** Admin bisa CRUD `Product` beserta child `ProductSize/ProductTemplate/ProductThemeColor/ProductAddon`; perubahan terbaca di katalog publik.
> Catatan PRD: katalog publik kini dari [src/lib/products.ts](../src/lib/products.ts) (in-memory). Story ini termasuk **migrasi sumber katalog ke DB** agar CRUD bermakna.

- [ ] `M` Router `admin.product.*` (`list/getById/create/update/delete`) + child entitas, zod, `adminProcedure`.
- [ ] `S` Alihkan `product` router publik membaca dari DB (bukan `src/lib/products.ts`); seed data existing ke DB.
- [ ] `M` Hubungkan UI [admin/products](../src/app/admin/products/) — tabel daftar, form create/edit (ukuran/template/warna/addon), hapus + konfirmasi.

#### S0.6 — CRUD Gallery
**AC:** Admin CRUD item galeri (gambar, judul, kategori, urutan); tampil di galeri publik.

- [ ] `S` Model `GalleryItem` (bila belum ada) + migrasi.
- [ ] `S` Router `admin.gallery.*` + zod.
- [ ] `S` Hubungkan UI [admin/gallery](../src/app/admin/gallery/) ke API (tabel + form + hapus).

#### S0.7 — CRUD Promo/diskon
**AC:** Admin CRUD promo (kode, tipe diskon %/nominal, periode aktif, status); siap dipakai di checkout (E4).

- [ ] `S` Model `Promo` + migrasi (kode unik, nilai, tanggal mulai/akhir, aktif).
- [ ] `S` Router `admin.promo.*` + zod (validasi tanggal & nilai).
- [ ] `S` Hubungkan UI [admin/promos](../src/app/admin/promos/) ke API.

#### S0.8 — Manajemen Customers
**AC:** Admin melihat & mengelola pelanggan (daftar, detail, cari, ubah role/nonaktif); tanpa mengekspos password.

- [ ] `S` Router `admin.customer.list/getById/update` (+ ubah role/status), `adminProcedure`, paginasi & pencarian.
- [ ] `S` Hubungkan UI [admin/customers](../src/app/admin/customers/) — tabel, detail, aksi.

#### S0.9 — CRUD Delivery-areas (zona & ongkir)
**AC:** Admin CRUD zona layanan + ongkir per zona; dipakai validasi alamat & ongkir checkout (lihat S4.3).

- [ ] `S` Model `DeliveryArea` (nama zona, ongkir, aktif) + migrasi.
- [ ] `S` Router `admin.deliveryArea.*` + zod.
- [ ] `S` Hubungkan UI [admin/delivery-areas](../src/app/admin/delivery-areas/) ke API. *(S4.3 lalu mereuse data ini.)*

---

## E1 — Fondasi Data & Skema (M1)

> Output: DB & tRPC siap menampung konsep sewa. Tidak ada perubahan UI fungsional.

### S1.1 — Perbarui enum status pesanan untuk siklus sewa
**Sebagai** sistem, **agar** status pesanan mencerminkan siklus sewa (pasang→ambil→kembali).
**AC:** `OrderStatus` punya `PENDING, CONFIRMED, SCHEDULED, INSTALLED, PICKED_UP, RETURNED, COMPLETED, CANCELLED`; nilai lama yang tak dipakai (`PROCESSING/SHIPPED/DELIVERED`) ditangani (migrasi/mapping). Build & generate Prisma lolos.

- [x] `XS` Ubah enum `OrderStatus` di [schema.prisma](../prisma/schema.prisma) sesuai §7.1 PRD.
- [x] `XS` Petakan/migrasikan data status lama bila ada (PROCESSING→CONFIRMED, SHIPPED→INSTALLED, DELIVERED→COMPLETED) di file migrasi. — mapping `CASE` tahan-data di migrasi `rental_foundation` (no-op pada DB dev kosong).
- [x] `XS` Audit pemakaian status lama di kode (`PROCESSING/SHIPPED/DELIVERED`) dan sesuaikan. — tak ada kode yang memakai enum Prisma; [admin/orders](../src/app/admin/orders/page.tsx) & [dashboard/orders](../src/app/dashboard/orders/page.tsx) memakai label Indonesia lokal (data statis), bukan enum DB.

### S1.2 — Tambah field sewa pada Order & OrderItem
**Sebagai** sistem, **agar** menyimpan periode sewa, deposit, dan tanggal acara.
**AC:** `Order` punya `rentalDeposit, depositRefunded, eventDate, discount, shippingProvider?, shippingService?, trackingNumber?`; `OrderItem` punya `installDate, rentalDays, pickupDate, unitId?` (§7.2–7.3). `pickupDate` = turunan server.

- [x] `XS` Tambah field sewa di model `Order` ([schema.prisma](../prisma/schema.prisma)).
- [x] `XS` Tambah field periode di model `OrderItem` (`installDate`, `rentalDays`, `pickupDate`, `unitId?`). — install/rental/pickup wajib (NOT NULL); `unitId` nullable (relasi `ProductUnit` menyusul di S1.3).
- [x] `XS` Tambah index yang berguna untuk query jadwal (mis. `@@index([installDate])`, `@@index([pickupDate])`). — + komposit `(productId, installDate, pickupDate)` & `unitId` (ERD §4); `Order.eventDate`.
- [x] `S` Buat & jalankan migrasi; verifikasi `prisma generate` + `npm run build`. — migrasi `init` (baseline) + `rental_foundation`; `prisma generate` & `npm run build` lolos.

### S1.3 — Model inventaris unit & opsi durasi
**Sebagai** admin, **agar** ketersediaan dihitung dari jumlah unit fisik.
**AC:** Model `ProductUnit` (§7.4) ada; pendekatan awal memakai **jumlah unit** (field `unitCount` per produk-ukuran) sesuai catatan PRD (a→b). Opsional `RentalDurationOption` (§7.5).

- [ ] `S` Putuskan pendekatan ketersediaan (a: `unitCount` sederhana vs b: `ProductUnit` individual) — catat keputusan di doc. **Default rekomendasi: mulai (a).**
- [ ] `XS` Tambah field `unitCount` pada `ProductSize` (atau `Product`) untuk pendekatan (a).
- [ ] `S` Tambah model `ProductUnit` untuk pendekatan (b) bila diputuskan; relasi ke `Product`.
- [ ] `XS` Tambah model `RentalDurationOption` (opsional) bila harga per-durasi dipakai.
- [ ] `XS` Jalankan migrasi + seed contoh stok pada produk yang ada.

---

## E2 — Ketersediaan & Pemesanan (M2)

> Output: pelanggan bisa menyewa end-to-end dengan DP manual. **Dependensi: E1 selesai.**

### S2.1 — Helper logika ketersediaan (server)
**Sebagai** sistem, **agar** menghitung bentrok periode secara konsisten.
**AC:** Fungsi murni menghitung tumpang tindih `[pasang, pickup]` dengan buffer hari, dan `pickupDate = installDate + rentalDays`. Mengembalikan `{ available, remainingUnits, nextAvailableDate? }`.

- [ ] `S` Tulis util hitung `pickupDate` & rentang dengan buffer (konfigurasi buffer hari) di [src/lib/](../src/lib/) + update barrel `index.ts`.
- [ ] `S` Tulis util cek tumpang tindih: `requestStart <= existingEnd && requestEnd >= existingStart` (§6.3).
- [ ] `S` Tulis fungsi hitung sisa unit untuk produk+ukuran pada periode (query order aktif, status bukan `CANCELLED`/`COMPLETED`).
- [ ] `XS` Util cari `nextAvailableDate` terdekat saat penuh.

### S2.2 — tRPC `rental.checkAvailability` & `rental.getBookedDates`
**Sebagai** pelanggan, **agar** tahu ketersediaan real-time saat memilih tanggal.
**AC:** `rental.checkAvailability` input `{ productId, sizeLabel, installDate, rentalDays }` → `{ available, pickupDate, nextAvailableDate?, remainingUnits }`. `rental.getBookedDates` mengembalikan tanggal penuh per produk-ukuran.

- [ ] `XS` Buat router `rental` di [src/server/api/routers/](../src/server/api/routers/) + daftarkan di [root.ts](../src/server/api/root.ts).
- [ ] `S` Implement `checkAvailability` (public query) memakai helper S2.1; validasi input dengan zod.
- [ ] `S` Implement `getBookedDates` (public query) untuk disable tanggal di kalender.
- [ ] `XS` Tambah unit-test manual/contoh input-output di doc (belum ada test runner).

### S2.3 — Komponen pemilihan periode di detail produk
**Sebagai** pelanggan, **agar** memilih tanggal pasang & durasi.
**AC:** Date picker dengan tanggal penuh ter-disable (dari `getBookedDates`), selector durasi (chip 1/3/7 hari) dengan harga dinamis, menampilkan estimasi tanggal ambil & status ketersediaan.

- [ ] `M` Komponen `RentalDatePicker` (kalender, disable tanggal penuh & < lead time) di [src/components/](../src/components/) + barrel.
- [ ] `S` Komponen `RentalDurationSelector` (chip 1/3/7, harga dinamis).
- [ ] `S` Integrasi di [products/[slug]](../src/app/products/[slug]/) — panggil `checkAvailability` saat tanggal/durasi berubah; tampilkan estimasi pickup + status.
- [ ] `S` State "Penuh" → tampilkan `nextAvailableDate` sebagai saran (anti-pattern MASTER.md dipatuhi).

### S2.4 — Badge & ketentuan sewa di katalog
**Sebagai** pelanggan, **agar** paham ini sewa (papan diambil kembali).
**AC:** Badge "Sewa" pada kartu & detail produk; blok ketentuan (durasi default, pasang–ambil, deposit). Tanpa emoji, pakai lucide-react.

- [ ] `XS` Komponen `RentalBadge` + tempel di kartu produk ([products](../src/app/products/)).
- [ ] `S` Blok "Ketentuan Sewa" di halaman detail produk.

### S2.5 — Keranjang & checkout dengan periode + deposit
**Sebagai** pelanggan, **agar** menyewa beberapa item dengan periode berbeda dan melihat rincian biaya.
**AC:** Keranjang menyimpan `installDate`+`rentalDays` per item; checkout menampilkan ringkasan periode (pasang→pickup, jumlah hari) & rincian biaya (subtotal+add-on+ongkir+deposit−diskon); form lokasi acara & penerima.

- [ ] `S` Perluas `useCart` ([use-cart.ts](../src/hooks/use-cart.ts)) untuk simpan periode sewa per item (ikuti pola localStorage+event).
- [ ] `S` Ringkasan periode di keranjang (pasang→pickup, hari).
- [ ] `M` Form checkout: lokasi acara, penerima, no HP, patokan, waktu acara, catatan papan (§5.1 F3).
- [ ] `S` Rincian biaya checkout termasuk deposit & diskon (ongkir manual untuk M2).
- [ ] `S` Pilih metode pembayaran (transfer/DP) + unggah/konfirmasi bukti.

### S2.6 — tRPC `order.createRental` transaksional
**Sebagai** sistem, **agar** mencegah double-booking saat membuat pesanan.
**AC:** `createRental` **memvalidasi ulang ketersediaan dalam satu transaksi DB** sebelum commit; hitung `pickupDate` di server; buat `Order`(PENDING)+`OrderItem`; nomor pesanan unik. Dua request bersamaan untuk unit terakhir → hanya satu sukses (§8 aturan kritis, §10.4).

- [ ] `M` Implement `order.createRental` (protected mutation) dengan `prisma.$transaction`; re-cek ketersediaan di dalam transaksi.
- [ ] `S` Generate `orderNumber` unik + hitung `pickupDate` server-side.
- [ ] `S` Validasi lead time minimum (H-1, konfigurasi) & input zod.
- [ ] `S` Halaman konfirmasi + nomor pesanan ([confirmation-order](../src/app/confirmation-order/)).
- [ ] `S` `order.listMine` + tampilkan riwayat di [dashboard/orders](../src/app/dashboard/orders/) dengan status sewa.

---

## E3 — Admin Operasional (M3)

> Output: operasional tercatat penuh. **Dependensi: E2 (struktur order sewa) selesai.**

### S3.1 — Router admin + guard role
**AC:** Procedure admin hanya untuk `UserRole.ADMIN`; router `admin` terdaftar di [root.ts](../src/server/api/root.ts).
> `adminProcedure` sudah dibuat di **S0.4** — story ini mereusenya, tinggal merangkai sub-router sewa.

- [ ] `XS` Pastikan `adminProcedure` (dari S0.4) tersedia di [trpc.ts](../src/server/api/trpc.ts).
- [ ] `XS` Buat router `admin` (+ sub-router `order`, `unit`, `calendar`) & daftarkan.

### S3.2 — Daftar & detail pesanan admin
**AC:** `admin.order.list` dengan filter status/rentang tanggal/kategori; halaman [admin/orders](../src/app/admin/orders/) terhubung data nyata.

- [ ] `S` Implement `admin.order.list` (filter + pagination).
- [ ] `M` Hubungkan UI [admin/orders](../src/app/admin/orders/) ke data (saat ini statis) — tabel + filter.
- [ ] `S` Halaman detail pesanan admin (item, periode, lokasi, pembayaran).

### S3.3 — Update status & jadwal pasang/pickup
**AC:** `admin.order.updateStatus` mengubah status mengikuti alur §6.2 dan menetapkan jadwal pasang; verifikasi pembayaran → CONFIRMED.

- [ ] `S` Implement `admin.order.updateStatus` (validasi transisi status yang valid).
- [ ] `S` Aksi "Verifikasi pembayaran" (PENDING→CONFIRMED) di UI admin.
- [ ] `S` Aksi set jadwal pasang (→SCHEDULED) + alokasi unit (`unitId`) bila pendekatan (b).

### S3.4 — Kalender pesanan admin
**AC:** `admin.calendar` mengembalikan pesanan untuk rentang tanggal; tampilan kalender bulanan/mingguan berdasarkan tanggal pasang & pickup.

- [ ] `S` Implement `admin.calendar` (input range → events pasang/pickup).
- [ ] `M` Komponen kalender admin (bulanan/mingguan) + filter status/kategori.

### S3.5 — Manajemen unit/stok & tugas lapangan
**AC:** `admin.unit.*` CRUD stok; daftar tugas pasang & ambil harian (alamat, waktu, item) untuk tim lapangan.

- [ ] `S` Implement `admin.unit.list/create/update/delete` (atau update `unitCount` bila pendekatan a).
- [ ] `S` UI kelola stok per produk-ukuran.
- [ ] `M` Halaman "Tugas Harian" — daftar pasang & daftar ambil per tanggal (alamat, waktu, item).

---

## E4 — Penyempurnaan Bisnis (M4)

> Output: aturan bisnis lengkap. **Dependensi: E3.**

### S4.1 — Deposit & penyelesaian pesanan
**AC:** Catat deposit diterima & dikembalikan; tandai `COMPLETED` setelah unit kembali (`RETURNED`) & deposit beres (§5.2 A4).

- [ ] `S` Aksi catat deposit & pelepasan (`depositRefunded`) di admin.
- [ ] `S` Alur status PICKED_UP→RETURNED→COMPLETED + catat kondisi unit (status `MAINTENANCE` bila rusak, §10.6).

### S4.2 — Kebijakan pembatalan & refund
**AC:** Pembatalan dengan kebijakan refund DP/deposit berdasarkan jarak ke tanggal acara (§10.3).

- [ ] `XS` Definisikan aturan refund (mis. H-3 potongan) — konfigurasi konstanta.
- [ ] `S` Mutation batal pesanan (customer/admin) + hitung refund + bebaskan unit.

### S4.3 — Zona layanan & ongkir manual
**AC:** Alamat acara dibatasi ke area layanan (Simpang Empat, Talu, Ujung Gading, Kinali, dll.); admin isi ongkir per zona (§10.8).

- [ ] `XS` Daftar zona layanan (reuse [admin/delivery-areas](../src/app/admin/delivery-areas/)).
- [ ] `S` Validasi alamat acara dalam zona saat checkout.
- [ ] `S` Field ongkir manual per zona di checkout/admin.

### S4.4 — Aturan ekspres duka cita & lead time
**AC:** Flag "express"/same-day untuk duka cita; lead time & buffer dapat dikonfigurasi (§10.1, §10.2, §10.7).

- [ ] `XS` Konfigurasi lead time & buffer terpusat di [src/lib/constant.ts](../src/lib/constant.ts).
- [ ] `S` Flag express (lewati/turunkan lead time untuk kategori Duka Cita).

---

## E5 — Otomasi (Future, M5)

> Disiapkan strukturnya sejak awal; implementasi menyusul. Field `shippingProvider/shippingService/trackingNumber` sudah ada dari S1.2.

- [ ] `L` S5.1 — Integrasi payment gateway otomatis.
- [ ] `L` S5.2 — Integrasi penyedia pengiriman (ongkir & resi via API kurir), isi `trackingNumber`.
- [ ] `M` S5.3 — Notifikasi WhatsApp/email (konfirmasi, pengingat pasang/ambil).
- [ ] `M` S5.4 — Dashboard analitik ([admin/reports](../src/app/admin/reports/)).

---

## Urutan Pengerjaan yang Disarankan

1. **E0** (S0.1→S0.4 auth/guard dulu, lalu S0.5→S0.9 CRUD) — fondasi teknikal; auth & guard memblok jalur pelanggan/admin. S0.5 (katalog ke DB) sebaiknya selesai sebelum E1/E2 agar data konsisten.
2. **E1** (S1.1 → S1.2 → S1.3) — fondasi data, tanpa ini story sewa terblok.
3. **E2** (S2.1 → S2.2 → S2.6 backend dulu, lalu S2.3–S2.5 UI) — jalur pelanggan end-to-end.
4. **E3** (S3.1 → S3.2 → S3.3 → S3.4 → S3.5) — operasional admin.
5. **E4** lalu **E5** sesuai prioritas bisnis.

## Pertanyaan Terbuka (blokir keputusan, dari §13 PRD)

- [ ] Deposit selalu berlaku atau hanya Premium/ukuran besar? → memengaruhi S2.5, S4.1.
- [ ] Durasi standar (1/3/7) & harga per-hari vs per-paket? → memengaruhi S1.3 (`RentalDurationOption`), S2.3.
- [ ] Unit dilacak per aset (kode) sejak M1 atau cukup jumlah stok? → memengaruhi S1.3 (a vs b).
- [ ] Kebijakan refund/pembatalan resmi? → memengaruhi S4.2.
- [ ] Perlu integrasi WhatsApp di rilis awal? → memengaruhi prioritas S5.3.
