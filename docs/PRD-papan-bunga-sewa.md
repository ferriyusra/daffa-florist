# PRD — Website Pemesanan Papan Bunga (Sistem Sewa)

**Produk:** Daffa Florist — Platform Sewa Papan Bunga
**Versi dokumen:** 1.0
**Tanggal:** 3 Juni 2026
**Status:** Draft
**Pemilik:** Tim Daffa Florist

---

## 1. Ringkasan Eksekutif

Daffa Florist saat ini melayani pemesanan papan bunga (wedding, duka cita, grand opening, congratulations, wisuda, dekorasi) untuk wilayah Pasaman Barat dan sekitarnya. Dokumen ini mendefinisikan kebutuhan untuk **fitur sistem sewa**, di mana pelanggan menyewa papan bunga untuk **periode waktu tertentu** (durasi tampil di lokasi acara), bukan membeli secara permanen.

Berbeda dengan model jual-putus, model sewa memperkenalkan tiga konsep inti yang harus didukung sistem:

1. **Periode sewa** — pelanggan hanya memilih **tanggal pasang** dan **durasi tampil**; tanggal ambil/pickup dihitung otomatis (`tanggal pasang + durasi`).
2. **Ketersediaan unit fisik** — jumlah papan/rangka terbatas; satu unit tidak bisa disewakan untuk dua acara yang periodenya bertumpang tindih.
3. **Siklus hidup pasca-acara** — penjadwalan pasang, pengambilan kembali (pickup), dan pengecekan kondisi unit.

Tujuan rilis ini adalah memungkinkan pelanggan memilih papan bunga, menentukan periode sewa, melihat ketersediaan secara real-time, melakukan pemesanan + pembayaran (DP/transfer manual), dan menerima konfirmasi — serta memberi admin alat untuk mengelola jadwal pasang/bongkar dan inventaris unit.

---

## 2. Latar Belakang & Masalah

### 2.1 Konteks bisnis

Papan bunga di Indonesia umumnya bersifat **sewa**: pelanggan membayar untuk rangkaian bunga + rangka papan yang **dipasang di lokasi acara selama beberapa hari**, lalu **diambil kembali** oleh penyedia. Rangka papan adalah aset yang dipakai ulang (reusable), sedangkan bunga/dekorasi bersifat habis pakai per acara.

### 2.2 Masalah yang ingin dipecahkan

- **Saat ini belum ada konsep periode & ketersediaan.** Model data sekarang ([prisma/schema.prisma](../prisma/schema.prisma)) memperlakukan pesanan seperti pembelian satu kali (`Order`, `OrderItem`) tanpa tanggal sewa, durasi, atau pengecekan bentrok jadwal.
- **Risiko double-booking.** Tanpa pelacakan ketersediaan unit fisik, dua pelanggan bisa memesan papan yang sama untuk tanggal yang sama.
- **Tidak ada manajemen logistik pasca-acara.** Tidak ada alur pickup/return atau pengecekan kondisi unit.
- **Pelanggan tidak bisa memilih tanggal acara** saat memesan.

### 2.3 Mengapa sekarang

Infrastruktur teknis pendukung sudah ada (Next.js 16 App Router, Prisma 7 + PostgreSQL, tRPC, NextAuth). Penambahan sistem sewa adalah evolusi natural dari katalog produk yang sudah berjalan.

---

## 3. Tujuan & Metrik Keberhasilan

### 3.1 Tujuan

| # | Tujuan | Metrik | Target |
|---|--------|--------|--------|
| G1 | Pelanggan bisa menyewa papan bunga untuk periode tertentu secara online | Pesanan sewa selesai (end-to-end) | > 80% pesanan via web |
| G2 | Mencegah double-booking | Insiden bentrok jadwal | 0 per bulan |
| G3 | Mempermudah operasional pasang/bongkar | Pesanan dengan jadwal pasang & pickup tercatat | 100% |
| G4 | Mempercepat konfirmasi pesanan | Waktu dari pesan → konfirmasi | < 30 menit (jam kerja) |

### 3.2 Non-tujuan (Out of Scope rilis ini)

- Pembayaran online otomatis terintegrasi penuh (gateway) — rilis awal cukup DP manual / transfer + konfirmasi admin. (Lihat §11 Roadmap.)
- Sistem loyalty / poin.
- Aplikasi mobile native.
- Multi-cabang / multi-vendor marketplace.
- Pelacakan kurir real-time (GPS).
- **Integrasi penyedia pengiriman otomatis** (hitung ongkir & resi via API kurir) — rilis awal ongkir diisi manual admin per zona; integrasi menyusul di M5. (Lihat §10.8 & §11.)

---

## 4. Persona Pengguna

| Persona | Deskripsi | Kebutuhan utama |
|---------|-----------|-----------------|
| **Pelanggan (Customer)** | Individu/perusahaan yang butuh papan bunga untuk acara | Pilih desain, tentukan tanggal & lokasi acara, tahu harga & ketersediaan, bayar, dapat konfirmasi |
| **Admin / Operator** | Staf Daffa Florist | Kelola katalog & unit, lihat kalender pesanan, atur jadwal pasang/bongkar, konfirmasi pembayaran, ubah status |
| **Tim Lapangan (Kurir/Pemasang)** | Petugas pasang & ambil papan | Lihat daftar tugas pasang/ambil harian beserta alamat & waktu |

---

## 5. Lingkup Fitur (Scope)

### 5.1 Sisi Pelanggan

#### F1 — Katalog papan bunga sewa
- Telusuri produk per kategori (Wedding, Duka Cita, Grand Opening, Congratulations, Wisuda, Dekorasi, Premium).
- Setiap produk menampilkan **harga sewa** (per periode standar, mis. 1–3 hari tampil), ukuran, template desain, warna tema, dan add-on (standing flower, dll.).
- Label jelas bahwa ini **sewa** (papan diambil kembali), termasuk durasi tampil default & ketentuan.

#### F2 — Pemilihan periode sewa & ketersediaan
Pelanggan hanya menentukan **dua hal**:
- **Tanggal pasang** — kapan papan dipasang di lokasi acara.
- **Durasi tampil** — berapa hari papan tampil (mis. 1 / 3 / 7 hari), dengan harga yang menyesuaikan.

Tanggal ambil/pickup **tidak diinput pelanggan**; sistem menghitungnya otomatis (`tanggal pasang + durasi`) untuk keperluan jadwal admin & cek ketersediaan.

- **Cek ketersediaan real-time**: jika unit untuk produk/ukuran tersebut sudah penuh pada periode yang dipilih, tampilkan pesan & sarankan tanggal lain.

#### F3 — Detail acara & pengiriman
- Form: nama penerima, no. HP, **alamat/lokasi acara**, kota, patokan lokasi, waktu acara.
- Catatan teks pada papan (mis. "Selamat & Sukses dari …").
- Pilih ukuran, template desain, warna tema, add-on.

#### F4 — Keranjang & checkout
- Keranjang mendukung beberapa item dengan periode sewa berbeda.
- Ringkasan biaya: subtotal sewa + add-on + ongkir − diskon.
- Pilih metode pembayaran (transfer / DP). Unggah/konfirmasi bukti.

#### F5 — Konfirmasi & pelacakan pesanan
- Nomor pesanan unik.
- Halaman status pesanan: `PENDING → CONFIRMED → SCHEDULED → INSTALLED → COMPLETED` (atau `CANCELLED`).
- Riwayat pesanan di dashboard pelanggan ([src/app/dashboard/](../src/app/dashboard/)).

#### F6 — Akun & alamat
- Reuse autentikasi & manajemen alamat yang sudah ada (NextAuth + model `Address`).

### 5.2 Sisi Admin

#### A1 — Manajemen katalog & inventaris unit
- CRUD produk, ukuran, template, warna, add-on (sudah sebagian ada di dashboard admin).
- **Manajemen unit fisik**: jumlah unit/stok rangka per produk-ukuran (untuk hitung ketersediaan).

#### A2 — Kalender & manajemen pesanan
- Tampilan **kalender** pesanan berdasarkan tanggal pasang & pickup.
- Filter per status, tanggal, kategori.
- Konfirmasi pembayaran & ubah status.

#### A3 — Jadwal pasang & bongkar (logistik)
- Daftar tugas **pasang** per hari (alamat, waktu, item).
- Daftar tugas **ambil/pickup** per hari.
- Catat kondisi unit saat kembali.

#### A4 — Penyelesaian pesanan
- Tandai pesanan `COMPLETED` setelah unit kembali & kondisinya dicek.

---

## 6. Alur Pengguna Utama (User Flows)

### 6.1 Alur sewa (Customer happy path)

```
Beranda → Katalog → Detail Produk
   → Pilih ukuran/template/warna/add-on
   → Pilih TANGGAL PASANG + DURASI tampil   (pickup dihitung otomatis)
   → Sistem cek ketersediaan unit untuk periode itu
        ├─ Tersedia  → tampilkan harga + estimasi tanggal ambil → Tambah ke keranjang
        └─ Penuh     → tampilkan tanggal alternatif terdekat
   → Checkout → isi lokasi acara & penerima → ringkasan biaya
   → Pilih pembayaran (DP/transfer) → konfirmasi
   → Pesanan dibuat (status PENDING) → halaman konfirmasi + nomor pesanan
```

### 6.2 Alur konfirmasi & operasional (Admin)

```
Admin lihat pesanan PENDING → verifikasi pembayaran → set CONFIRMED
   → Pesanan masuk kalender → set jadwal pasang (SCHEDULED)
   → Hari-H: tim pasang → set INSTALLED
   → Setelah masa sewa selesai → set COMPLETED
```

### 6.3 Aturan ketersediaan (inti sistem sewa)

Sebuah unit `produk+ukuran` **tidak tersedia** untuk periode `[pasang, pickup]` jika jumlah pesanan aktif (status bukan `CANCELLED`/`COMPLETED`-yang-sudah-kembali) yang periodenya **bertumpang tindih** ≥ jumlah unit fisik yang dimiliki.

Tumpang tindih: `requestStart <= existingEnd` **DAN** `requestEnd >= existingStart`. Perlu buffer hari untuk pasang/bongkar (mis. +1 hari sebelum & sesudah, dapat dikonfigurasi).

---

## 7. Kebutuhan Data (Model)

Perluasan dari [prisma/schema.prisma](../prisma/schema.prisma) yang sudah ada. **Perubahan utama** ditandai 🆕.

### 7.1 Penyesuaian enum status

```prisma
enum OrderStatus {
  PENDING        // menunggu pembayaran/verifikasi
  CONFIRMED      // pembayaran terverifikasi
  SCHEDULED      // 🆕 jadwal pasang ditetapkan
  INSTALLED      // 🆕 sudah dipasang di lokasi
  COMPLETED      // 🆕 pesanan tuntas
  CANCELLED
}
```

### 7.2 Order — tambahan field sewa

```prisma
model Order {
  // ... field existing (orderNumber, userId, addressId, subtotal, total, dst.)
  eventDate       DateTime?                // 🆕 tanggal & jam acara
  discount        Int       @default(0)   // 🆕 potongan harga (lihat ringkasan biaya F4)
  shippingProvider String?                // 🆕 (future M5) MANUAL | JNE | GOSEND | ...
  shippingService  String?                // 🆕 (future M5) jenis layanan provider
  trackingNumber   String?                // 🆕 (future M5) no. resi dari provider
  // ...
}
```

### 7.3 OrderItem — periode sewa per item

```prisma
model OrderItem {
  // ... field existing (productSlug, sizeLabel, price, quantity, dst.)
  installDate  DateTime  // 🆕 tanggal pasang  — satu-satunya tanggal yang diinput pelanggan
  rentalDays   Int       // 🆕 durasi tampil (hari) — input pelanggan
  pickupDate   DateTime  // 🆕 tanggal ambil — TURUNAN: installDate + rentalDays, dihitung server saat simpan
  unitId       String?   // 🆕 unit fisik yang dialokasikan (opsional saat PENDING)
  // ...
}
```

> `pickupDate` disimpan (bukan diinput) agar query ketersediaan & jadwal admin cepat tanpa menghitung ulang. Sumber kebenarannya tetap `installDate + rentalDays` — hitung sekali di server saat `createRental`, dan hitung ulang jika durasi diubah.

### 7.4 🆕 ProductUnit — inventaris unit fisik

```prisma
model ProductUnit {
  id        String  @id @default(cuid())
  productId String
  sizeLabel String?            // unit untuk ukuran tertentu (opsional)
  code      String  @unique    // kode aset fisik, mis. "WD-001"
  status    String  @default("AVAILABLE") // AVAILABLE | RENTED | MAINTENANCE | RETIRED
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId])
}
```

> Catatan: ketersediaan dapat dihitung dua cara — (a) berbasis **jumlah unit** per produk-ukuran (lebih sederhana, cukup field `unitCount`), atau (b) berbasis **alokasi unit individual** (`ProductUnit`, mendukung pelacakan kondisi per aset). Disarankan mulai dari (a) dan naik ke (b) saat skala bertambah.

### 7.5 (Opsional) RentalDurationOption — opsi durasi & harga

```prisma
model RentalDurationOption {
  id        String @id @default(cuid())
  productId String
  days      Int            // 1, 3, 7, ...
  price     Int            // harga sewa untuk durasi tsb.
  product   Product @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId])
}
```

---

## 8. Kebutuhan API (tRPC)

Tambahan router di [src/server/](../src/server/) (sejalan dengan arsitektur tRPC existing):

| Procedure | Tipe | Deskripsi |
|-----------|------|-----------|
| `rental.checkAvailability` | query | Input `{ productId, sizeLabel, installDate, rentalDays }` (pickup dihitung server) → `{ available: boolean, pickupDate, nextAvailableDate?, remainingUnits }` |
| `rental.getBookedDates` | query | Tanggal-tanggal penuh untuk sebuah produk-ukuran (untuk disable di kalender) |
| `order.createRental` | mutation | Buat pesanan sewa; **validasi ulang ketersediaan di server** sebelum commit (cegah race condition) |
| `order.listMine` | query | Riwayat pesanan pelanggan |
| `admin.order.list` | query | Daftar pesanan + filter (status, rentang tanggal) |
| `admin.order.updateStatus` | mutation | Ubah status & jadwal pasang/pickup |
| `admin.calendar` | query | Pesanan untuk tampilan kalender (range tanggal) |
| `admin.unit.*` | query/mutation | CRUD unit/stok |

**Aturan kritis:** validasi ketersediaan **wajib diulang di server** dalam transaksi DB saat `createRental` (mis. `SELECT ... FOR UPDATE` atau cek-lalu-insert dalam satu transaksi Prisma) untuk mencegah double-booking pada permintaan bersamaan.

---

## 9. Kebutuhan UI/UX

Mengikuti design system di [design-system/daffa-florist/MASTER.md](../design-system/daffa-florist/MASTER.md) dan token di [globals.css](../src/app/globals.css) (blush `--primary: #9D174D`, sage `--secondary: #3D6B4F`, gold `--accent: #8B6914`).

Komponen baru/utama:
- **Date picker / kalender ketersediaan** pada halaman detail produk — tanggal penuh ter-disable, hover menampilkan status.
- **Selector durasi sewa** (chip 1/3/7 hari) dengan harga dinamis.
- **Badge "Sewa"** & blok ketentuan (pasang–ambil) pada kartu & detail produk.
- **Ringkasan periode** di keranjang & checkout (pasang → pickup, jumlah hari).
- **Kalender admin** (bulanan/mingguan) untuk pesanan.
- **Daftar tugas harian** pasang & ambil untuk tim lapangan.

Patuhi anti-pattern MASTER.md: tanpa emoji (pakai `lucide-react`), `cursor-pointer` pada elemen klik, transisi 150–300ms, tanpa hover yang menggeser layout. Bahasa Indonesia di seluruh copy & SEO.

---

## 10. Aturan Bisnis & Edge Case

1. **Lead time minimum** — pemesanan minimal H-1 (atau dapat dikonfigurasi); tanggal yang terlalu dekat di-disable.
2. **Buffer pasang/bongkar** — unit "terkunci" +1 hari sebelum & sesudah periode tampil (konfigurasi).
3. **Pembatalan** — kebijakan refund DP berdasarkan jarak ke tanggal acara (mis. batal H-3 = potongan).
4. **Race condition** — dua pelanggan memesan unit terakhir bersamaan → hanya satu berhasil (validasi transaksional di server).
5. **Perpanjangan sewa** — pelanggan minta tambah durasi → cek ketersediaan periode lanjutan.
6. **Kerusakan/keterlambatan kembali** — denda keterlambatan; status `MAINTENANCE` untuk unit rusak.
7. **Duka cita** — sering butuh **cepat/same-day**; pertimbangkan flag "express".
8. **Zona layanan & ongkir** — batasi alamat acara ke area layanan (Simpang Empat, Talu, Ujung Gading, Kinali, Sasak Ranah Pasisie, Pasaman, dll.). **Rilis awal:** ongkir **diisi manual** oleh admin per zona. **Masa depan (M5):** ongkir dihitung otomatis lewat **integrasi penyedia pengiriman** (API rate kurir) dan nomor resi disimpan untuk pelacakan. Field `Order.shippingProvider`, `Order.shippingService`, dan `Order.trackingNumber` (nullable) disiapkan sejak awal agar integrasi tidak mengubah struktur data.

---

## 11. Rencana Rilis (Milestones)

| Fase | Lingkup | Output |
|------|---------|--------|
| **M1 — Fondasi data** | Migrasi schema (status sewa, field periode, unit/stok) | DB & tRPC siap |
| **M2 — Ketersediaan & pemesanan** | Date picker, cek ketersediaan, `createRental` transaksional, checkout DP manual | Pelanggan bisa sewa end-to-end |
| **M3 — Admin operasional** | Kalender pesanan, update status, jadwal pasang/pickup, manajemen unit | Operasional tercatat penuh |
| **M4 — Penyempurnaan** | Penyelesaian pesanan, kebijakan batal, zona ongkir, ekspres duka cita | Aturan bisnis lengkap |
| **M5 — (Future)** | Payment gateway otomatis, **integrasi penyedia pengiriman (ongkir & resi via API kurir)**, notifikasi WA/email, dashboard analitik | Otomasi & skala |

---

## 12. Risiko & Asumsi

**Risiko**
- **Double-booking** jika validasi tidak transaksional → mitigasi: cek di server dalam transaksi.
- **Kompleksitas kalender** ketersediaan multi-ukuran/multi-unit → mulai dari model jumlah unit sederhana.
- **Logistik manual** (pasang/ambil) bergantung kedisiplinan input admin.

**Asumsi**
- Pembayaran awal cukup manual (transfer + verifikasi admin) di M1–M4.
- Notifikasi awal manual (admin hubungi via WA); otomatisasi menyusul.
- Skala awal: satu cabang, jumlah unit terbatas, area Pasaman Barat.

---

## 13. Pertanyaan Terbuka

1. Durasi tampil standar berapa hari (1/3/7), dan apakah harga per hari atau per paket durasi?
2. Apakah unit dilacak per aset individual (kode) sejak M1, atau cukup jumlah stok?
3. Kebijakan refund/pembatalan resmi seperti apa?
4. Apakah perlu integrasi WhatsApp untuk konfirmasi otomatis pada rilis awal?

---

*Dokumen ini adalah draft awal untuk diskusi. Bagian §7 (model data) dan §8 (API) dirancang agar kompatibel dengan stack existing: Next.js 16 App Router, Prisma 7 + PostgreSQL, tRPC 11, dan NextAuth.*
